import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Helper function to build dynamic, origin-restricted CORS headers
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowedOriginsEnv = process.env.FRAMER_ALLOWED_ORIGINS || "";
  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  let matchedOrigin = "";

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    matchedOrigin = requestOrigin;
  }

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };

  if (matchedOrigin) {
    headers["Access-Control-Allow-Origin"] = matchedOrigin;
  }

  return headers;
}

// Helper wrapper to attach CORS headers to all NextResponse responses
function jsonWithCors(data: any, init?: ResponseInit, requestOrigin?: string | null) {
  const cors = getCorsHeaders(requestOrigin ?? null);
  const existingHeaders = (init?.headers as Record<string, string>) || {};
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...cors,
      ...existingHeaders,
    },
  });
}

// OPTIONS preflight handler for CORS
export async function OPTIONS(req: Request) {
  const requestOrigin = req.headers.get("origin");
  const headers = getCorsHeaders(requestOrigin);

  return new Response(null, {
    status: 204,
    headers,
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json();
    const { message, history } = body || {};

    // 1. Input Validation & Abuse Protection
    if (!message || typeof message !== "string" || !message.trim()) {
      return jsonWithCors(
        { error: "Message content cannot be empty." },
        { status: 400 },
        origin
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 500) {
      return jsonWithCors(
        { error: "Message exceeds maximum allowed length of 500 characters." },
        { status: 400 },
        origin
      );
    }

    // 2. Load Single Source of Truth Profile Knowledge Base
    let profileKnowledge = "";
    try {
      const profilePath = path.join(process.cwd(), "content", "rifat-profile.md");
      if (fs.existsSync(profilePath)) {
        profileKnowledge = fs.readFileSync(profilePath, "utf-8");
      }
    } catch (fsErr) {
      console.error("[RIFAT Ai Server Error] Failed to read profile knowledge base:", fsErr);
    }

    // 3. Construct Enhanced Human Persona & System Prompt
    const systemInstruction = `You are RIFAT Ai, the digital personal representative of Rifat.
Your sole job is to answer portfolio visitors naturally, accurately, professionally, and conversationally about Rifat's skills, projects, services, work style, and contact options, based strictly on Rifat's official profile knowledge below.

=== RIFAT'S OFFICIAL PROFILE KNOWLEDGE ===
${profileKnowledge}
==========================================

STRICT IDENTITY & BEHAVIOR RULES:
1. IDENTITY: Always introduce yourself or speak as Rifat's Personal AI Representative (e.g. "I'm Rifat's personal AI assistant" or "I represent Rifat"). NEVER say "I am Rifat" or claim Rifat is personally typing the message.
2. NATURAL HUMAN TONE: Speak like a smart, friendly, confident human representative.
   - ABSOLUTELY FORBIDDEN CLICHÉS: Never use "As an AI language model...", "Certainly!", "I'd be happy to assist you...", "Great question!", "How may I assist you today?", or robotic corporate fluff.
   - Do NOT repeat Rifat's name unnecessarily in every sentence.
3. CONCISENESS FIRST: Keep standard responses concise (1 to 3 natural sentences). Only expand into detailed bullet points or steps when the visitor explicitly asks for deep details or breakdowns.
4. STRICT ACCURACY (NO HALLUCINATIONS): Answer strictly based on the provided profile. Never invent client names, project results, exact rates, years of experience, or degrees if they are missing or listed under [TODO].
5. MISSING INFORMATION RULE: If asked something not detailed in Rifat's profile (or marked as TODO), reply naturally and directly:
   "I don't have that specific detail handy right now, but feel free to reach out to Rifat directly to discuss it!"
6. LEAD & HIRING INTENT: If a visitor wants to hire Rifat, start a project, or asks about rates, respond warmly with available details and guide them to contact Rifat directly.
7. NO FAKE TOOL ACTIONS: Never claim to actually send an email, book a calendar meeting, or call Rifat on the phone unless an explicit live tool is triggered.`;

    // 4. Process Conversation Memory (Rolling History capped to last 10 messages)
    const formattedContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const item of recentHistory) {
        if (item && typeof item.text === "string" && item.text.trim()) {
          formattedContents.push({
            role: item.isUser ? "user" : "model",
            parts: [{ text: item.text.trim() }],
          });
        }
      }
    }

    // Append current user message
    formattedContents.push({
      role: "user",
      parts: [{ text: trimmedMessage }],
    });

    // 5. Call Google Gemini API with Controlled Model Fallback Chain (Server-side ONLY)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[RIFAT Ai Server Warning] GEMINI_API_KEY is not configured in server environment.");
      return jsonWithCors(
        {
          answer: "I'm currently operating in offline preview mode while server configuration is being finalized. You can reach out to Rifat directly through the portfolio links!"
        },
        { status: 200 },
        origin
      );
    }

    const primaryModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const fallback1Model = process.env.GEMINI_MODEL_FALLBACK_1 || "gemini-3.5-flash-lite";
    const fallback2Model = process.env.GEMINI_MODEL_FALLBACK_2 || "gemini-3.1-flash-lite";

    const rawCandidates = [primaryModel, fallback1Model, fallback2Model];
    const modelCandidates = rawCandidates.filter(
      (m, idx) => typeof m === "string" && m.trim().length > 0 && rawCandidates.indexOf(m) === idx
    );

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 500,
      },
    };

    let generatedText: string | null = null;

    for (let i = 0; i < modelCandidates.length; i++) {
      const currentModel = modelCandidates[i];
      const modelLabel = i === 0 ? "primary model" : `fallback ${i} model`;
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      try {
        const apiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(geminiPayload),
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (candidateText) {
            generatedText = candidateText;
            if (i > 0) {
              console.log(`[RIFAT Ai] ${modelLabel} (${currentModel}) succeeded.`);
            } else {
              console.log(`[RIFAT Ai] primary model (${currentModel}) succeeded.`);
            }
            break;
          }
        }

        // Handle error responses
        const rawErrorText = await apiResponse.text();
        const sanitizedError = apiKey ? rawErrorText.replaceAll(apiKey, "[REDACTED]") : rawErrorText;
        const status = apiResponse.status;

        const isModelNotFound =
          status === 404 ||
          sanitizedError.includes("NOT_FOUND") ||
          sanitizedError.includes("no longer available") ||
          sanitizedError.includes("not found");
        const isTransientOrQuota = status === 429 || status === 408 || (status >= 500 && status <= 599);

        const isFallbackEligible = isTransientOrQuota || isModelNotFound;

        if (isFallbackEligible && i < modelCandidates.length - 1) {
          const nextModel = modelCandidates[i + 1];
          console.warn(
            `[RIFAT Ai] ${modelLabel} (${currentModel}) failed with HTTP ${status}. Retrying with fallback model (${nextModel})...`
          );
          continue;
        } else {
          console.error(
            `[RIFAT Ai] ${modelLabel} (${currentModel}) failed with HTTP ${status}. ${
              isFallbackEligible ? "No more fallback models available." : "Non-fallback eligible error."
            }`
          );
          break;
        }
      } catch (fetchErr: any) {
        console.error(`[RIFAT Ai] ${modelLabel} (${currentModel}) network exception:`, fetchErr?.message || fetchErr);
        if (i < modelCandidates.length - 1) {
          continue;
        }
      }
    }

    if (generatedText) {
      return jsonWithCors(
        { answer: generatedText },
        { status: 200 },
        origin
      );
    }

    return jsonWithCors(
      { answer: "Looks like I'm having a connection issue right now. You can still reach Rifat directly through the contact links." },
      { status: 200 },
      origin
    );

  } catch (error: any) {
    console.error("[RIFAT Ai API Error]", error);
    return jsonWithCors(
      { answer: "Looks like I'm having a connection issue right now. You can still reach Rifat directly through the contact links." },
      { status: 500 },
      origin
    );
  }
}

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Helper function to build dynamic, origin-restricted CORS headers
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowedOriginsEnv = process.env.FRAMER_ALLOWED_ORIGINS || "";
  const defaultAllowed = [
    "https://meetrifat.framer.ai",
    "https://framer.com",
    "https://framer.app",
    "https://canvas.framer.app",
    "https://framerusercontent.com",
    "https://events.framer.com",
    "http://localhost:3000",
    "null",
  ];
  const envOrigins = allowedOriginsEnv
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = Array.from(new Set([...defaultAllowed, ...envOrigins]));

  let matchedOrigin = "";

  if (requestOrigin && typeof requestOrigin === "string") {
    const cleanOrigin = requestOrigin.toLowerCase().trim();
    if (
      allowedOrigins.includes(requestOrigin) ||
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin === "null" ||
      cleanOrigin.includes("framer") ||
      cleanOrigin.includes("localhost") ||
      cleanOrigin.includes("127.0.0.1") ||
      cleanOrigin.startsWith("file://") ||
      cleanOrigin.startsWith("app://")
    ) {
      matchedOrigin = requestOrigin;
    }
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

        // 3. Construct Enhanced First-Person Persona & System Prompt
    const systemInstruction = `You are RIFAT Ai, a conversational first-person interface through which portfolio visitors interact with Rifat.

=== RIFAT'S OFFICIAL PROFILE KNOWLEDGE ===
${profileKnowledge}
==========================================

STRICT CORE PERSONA & VOICE RULES:

1. FIRST-PERSON VOICE (MANDATORY):
   When answering questions about Rifat's identity, background, work, skills, experience, projects, services, technologies, interests, goals, or professional activities:
   - ALWAYS speak naturally in FIRST PERSON from Rifat's perspective.
   - Use: "I", "I'm", "I've", "my work", "my skills", "my projects", "my experience", "I build", "I use", "I create".
   - NEVER introduce yourself as "Rifat's personal AI assistant", "Rifat's representative", or "Rifat's AI assistant".
   - NEVER describe Rifat in the third person ("Rifat is...", "His skills include...", "Rifat has worked on...").

2. SPECIFIC IDENTITY HANDLING ("Who are you?"):
   - If asked "Who are you?", "Tell me about yourself", "What do you do?", "Who is this?", "Introduce yourself", answer directly in Rifat's first-person voice using facts strictly from the profile.
   - Example tone: "I'm Rifat! I'm a web developer and AI integration engineer. I specialize in building modern, high-performance web applications and interactive experiences." (Only use facts documented in the profile above).

3. HONEST AI DISCLOSURE (ONLY WHEN EXPLICITLY ASKED ABOUT THE AI):
   - If (and ONLY if) the visitor specifically asks whether you are an AI or actually Rifat (e.g. "Are you an AI?", "Are you actually Rifat?", "Are you a bot?"), answer honestly while maintaining a natural tone:
     "I'm RIFAT Ai, the AI interface on Rifat's portfolio. I speak from Rifat's perspective so you can explore my work and background through a natural conversation."
   - For all normal questions about life, work, skills, and projects, remain strictly in first-person ("I", "my").

4. STRICT KNOWLEDGE GROUNDING (NEVER INVENT FACTS):
   - Answer strictly based on Rifat's official profile knowledge provided above.
   - NEVER invent or hallucinate client names, project results, locations not listed, exact rates, years of experience, degrees, or unmentioned facts.

5. UNKNOWN INFORMATION HANDLING:
   - If asked something not contained in the profile knowledge (or marked as TODO), state naturally in first person without robotic meta-talk:
     "I haven't shared that detail here yet, but feel free to reach out to me directly to discuss it!"
   - NEVER say "Rifat's profile indicates..." or "According to the profile...".

6. CONVERSATIONAL TONE & LENGTH:
   - Keep normal answers concise (1 to 3 natural, conversational sentences).
   - Use natural contractions ("I'm", "I've", "I'd", "I work").
   - NEVER use robotic clichés ("As an AI language model...", "Certainly!", "I'd be happy to assist...", "Great question!", "As per available information...").
   - Sound like a real person having a natural conversation.

7. HIRING & CONTACT INTENT:
   - If a visitor wants to hire, start a project, or asks about rates, respond warmly from Rifat's perspective and invite them to reach out directly via the contact options on the portfolio.`;

    // 4. Process Conversation Memory (Rolling History capped to last 10 messages)
    const formattedContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const item of recentHistory) {
        if (item && typeof item.text === "string" && item.text.trim()) {
          formattedContents.push({
            role: (item.isUser === true || item.role === "user" || item.sender === "user") ? "user" : "model",
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

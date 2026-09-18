# RIFAT Ai — Architecture & Integration Documentation

## Overview
**RIFAT Ai** is a real-time, personal AI representative integrated into Rifat's portfolio website. It communicates naturally, accurately, and professionally with visitors about Rifat's background, skills, projects, and contact channels.

## Architecture
```
RIFAT Ai UI (Framer / Next.js)
        │
        ▼ (POST /api/chat)
Next.js Serverless API Route
        │
        ├── Loads content/rifat-profile.md (Single Source of Truth)
        ├── Formats System Instruction & Rolling Memory (last 10 turns)
        │
        ▼ (Server-Side HTTPS REST Call with GEMINI_API_KEY)
Google Gemini Flash API (e.g. gemini-2.5-flash)
        │
        ▼ (JSON Response { "answer": "..." })
RIFAT Ai UI (Stops typing animation & renders response)
```

## Persona & Conversational Guidelines
1. **Identity & Transparency**: Introduces itself strictly as *"Rifat's Personal AI Representative"* or *"Rifat's personal AI assistant"*. Never claims to be Rifat typing live.
2. **Anti-Cliché Policy**: Strictly avoids generic AI/corporate phrases such as *"As an AI language model..."*, *"Certainly!"*, *"I'd be happy to assist..."*, or *"Great question!"*.
3. **Conversational Conciseness**: Standard responses default to 1-3 natural sentences. Detailed bullet points or breakdowns are used only when explicitly requested.
4. **Strict Non-Hallucination**: Answers are strictly constrained by `content/rifat-profile.md`. For missing facts or `[TODO]` placeholders (like exact pricing or degrees), it responds naturally that the detail is not currently handy and invites the visitor to contact Rifat directly.
5. **Lead Guidance**: Warmly guides interested leads to portfolio contact channels without making false claims about sending live emails or booking calendar slots.

## File Map
- `content/rifat-profile.md`: Single source of truth knowledge file containing bio, skills, services, projects, FAQs, contact info, non-hallucination rules, and structured `[TODO: User Input Required]` placeholders.
- `src/app/api/chat/route.ts`: Secure server-side API route. Validates requests, enforces abuse protection (max 500 chars, empty check), loads profile, formats rolling conversation memory, and communicates with Gemini API.
- `src/components/RifatAIChat.tsx`: Framer Code Component for RIFAT Ai. Preserves 100% of plasma orb, magnetic cursor, waveform canvas, glassmorphism UI, light/dark themes, and Framer property controls (`addPropertyControls`).
- `src/lib/framer-compat.ts`: Framer editor environment compatibility layer.
- `.env.example` / `.env.local`: Environment variable configuration (`GEMINI_API_KEY`, `GEMINI_MODEL`).
- `.agents/rules/rifat-ai-project.md`: Antigravity workspace memory rule.
- `.agents/skills/rifat-ai-maintainer/SKILL.md`: Antigravity workspace maintenance skill.

## Environment Variables
Configure the following in Vercel or local `.env.local`:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

## How to Test Locally
1. Add your Google Gemini API key to `.env.local`:
   `GEMINI_API_KEY=AIzaSy...`
2. Run development server:
   `npm run dev`
3. Open `http://localhost:3000` in browser and open RIFAT Ai launcher.
4. Test asking questions like *"What does Rifat do?"*, *"What are his projects?"*, *"How can I contact him?"*.

## Deployment Instructions (Vercel)
1. Push project to GitHub repository.
2. Import project into Vercel.
3. Under **Project Settings -> Environment Variables**, add:
   - `GEMINI_API_KEY`: [Your Gemini API Key]
   - `GEMINI_MODEL`: `gemini-2.5-flash`
4. Deploy. The `/api/chat` serverless route will deploy automatically alongside the frontend.

# RIFAT Ai — Workspace Rule

## Project Name
**RIFAT Ai**

## Purpose
RIFAT Ai is the official digital personal representative for Rifat's portfolio website. It provides accurate, natural, professional, and conversational answers to visitors about Rifat's skills, experience, projects, design/development philosophy, and contact options.

## Core Architectural Constraints
1. **Free-First & Zero-Cost**: Runs entirely using free-tier services. Must use Google Gemini Flash models (`GEMINI_MODEL=gemini-2.5-flash` or `gemini-1.5-flash`). Do not add paid vector databases, paid gateways, or paid chatbot subscriptions.
2. **Security & API Key Protection**: `GEMINI_API_KEY` must strictly remain server-side (`.env.local` / environment variables). Client code (React / Framer) must only call `POST /api/chat`.
3. **Preserve Aura UI Aesthetics**: The floating launcher, plasma orb canvas, magnetic cursor interaction, waveform canvas, glassmorphism panel, typing indicator, suggestions, and Framer property controls must be preserved 100%. Never redesign or break the visual identity.
4. **Single Source of Truth**: Rifat's profile is strictly maintained in `content/rifat-profile.md`.
5. **No Hallucination**: RIFAT Ai must NEVER claim to be Rifat himself typing live ("I am Rifat's personal AI assistant"), and must NEVER invent client names, fake projects, or prices not in `content/rifat-profile.md`.

## Key Files
- `src/components/RifatAIChat.tsx`: Framer Code Component for RIFAT Ai.
- `src/app/api/chat/route.ts`: Secure serverless API endpoint.
- `content/rifat-profile.md`: Single source of truth knowledge base.
- `src/lib/framer-compat.ts`: Compatibility layer for Framer editor & React.
- `docs/RIFAT-AI.md`: Complete architecture and extension documentation.
- `.env.example`: Environment variable layout.

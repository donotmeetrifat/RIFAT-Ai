---
name: rifat-ai-maintainer
description: Maintain, test, expand, and deploy the RIFAT Ai personal assistant project while preserving Aura UI aesthetics, zero-cost architecture, and server-side secret protection.
---

# RIFAT Ai Maintainer Skill

Use this skill when maintaining, testing, updating, or expanding the RIFAT Ai project.

## Maintenance Checklist

### 1. Pre-edit Inspection
- Always read `.agents/rules/rifat-ai-project.md` and `docs/RIFAT-AI.md`.
- Inspect existing implementations before making any edits.

### 2. UI Preservation
- Preserve all visual design tokens, plasma orb animations, magnetic cursor movement, waveform canvas, glassmorphism, and Framer property controls in `src/components/RifatAIChat.tsx`.
- Keep Framer defaults synced (`assistantName: "RIFAT Ai"`, `statusLabel: "AI Assistant · online"`).

### 3. Knowledge Base Maintenance
- Update Rifat's portfolio data strictly inside `content/rifat-profile.md`.
- Never invent facts about Rifat.

### 4. API & Secret Security
- Ensure `GEMINI_API_KEY` is only used inside server-side API routes (`src/app/api/chat/route.ts`).
- Never leak `GEMINI_API_KEY` to client JS bundles or HTML.

### 5. Testing & Verification
- Test local build with `npm run build`.
- Verify POST `/api/chat` with test messages.
- Test conversation history rolling window (last 10 turns).
- Test mobile view & Framer canvas controls.

# agentic-voice-ai-persona-platform
Production-oriented agentic voice AI platform for dynamic AI personas with personalized knowledge, RAG, real-time speech, multimodal interaction, and model-driven behavior.

---

# PersonaAI — Frontend Prototype (Step 1)

A premium AI voice persona platform prototype — **front-end only**.

Choose a persona, give it context, and have a natural voice conversation.

> **Scope:** This repository currently contains the product experience and
> frontend architecture only. There is no backend, no AI model, no
> speech-to-text, no text-to-speech, no authentication, no database and no real
> file upload. All personas, transcripts and voice states are simulated in the
> browser.

## Tech stack

- Next.js 15 (App Router, `src/` directory)
- React 19 + TypeScript (strict)
- Tailwind CSS v4
- Radix UI primitives + Lucide icons
- No state-management or data-fetching libraries

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
```

## Routes

| Route                      | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `/`                        | Landing page: hero, personas, how it works, CTA     |
| `/personas`                | Persona explorer: search, filters, featured, recent |
| `/personas/[id]`           | Persona profile: traits, knowledge, voice, details  |
| `/personas/create`         | Five-step persona creation wizard                   |
| `/conversation/[personaId]` | Voice conversation environment                      |
| `/my-personas`             | Created, recently used and favourite personas       |
| `/settings`                | Account, appearance, voice, conversation, privacy…   |

## Architecture

```
src/
├── app/
│   ├── (product)/            # routes with header + footer chrome
│   │   ├── page.tsx          # landing
│   │   ├── personas/
│   │   ├── my-personas/
│   │   └── settings/
│   ├── conversation/[personaId]/   # full-screen voice experience
│   ├── layout.tsx            # fonts, metadata
│   └── not-found.tsx
├── components/
│   ├── landing/              # hero + marketing sections
│   ├── layout/               # site header / footer
│   ├── personas/             # avatar, card, profile, explorer, library, wizard
│   ├── conversation/         # header, transcript, message, view
│   ├── voice/                # orb, visualizer, microphone button
│   ├── settings/             # reusable setting primitives
│   └── ui/                   # button, card, field, dialog, switch, primitives
├── config/site.ts            # product name, tagline, nav links
├── data/personas.ts          # MOCK personas, library, transcripts
├── hooks/use-voice-session.ts# simulated voice state machine
├── lib/utils.ts              # cn(), formatting helpers
└── types/persona.ts          # Persona, VoiceState, PersonaDraft, …
```

**Key decisions**

- **Route groups** — `(product)` supplies the standard chrome; the conversation
  route sits outside it and renders full-screen, so the voice UI stays
  distraction-free without duplicating layouts.
- **Single layout, responsive** — one markup tree per page using CSS grid/flex
  breakpoints. No separate mobile/desktop components.
- **Data-driven personas** — colour, avatar, voice, capabilities and the safety
  `disclaimer` all live on the `Persona` type, so nothing is hardcoded per
  persona. Adding a persona means adding a data object.
- **UI primitives** — a small shadcn-style layer (Button, Card, Field, Dialog,
  Switch, Badge) keeps styling consistent without pulling in a full library.
- **Isolation of simulation** — all fake voice logic lives in
  `hooks/use-voice-session.ts`, so it can be replaced by a real audio pipeline
  without touching presentation components.
- **Naming** — the product name lives only in `config/site.ts`.

## What is mocked

- Personas, library entries and transcripts (`src/data/personas.ts`)
- Conversation state machine: idle → listening → processing → speaking →
  error, driven by timers in `useVoiceSession`
- Knowledge "upload" (adds sample rows only)
- Settings values (local component state)
- Persona creation (session-local state)

## Prototype notes

- The error state on the conversation screen is reachable for demonstration;
  there is no real connection that can fail yet.
- Personas are illustrative examples. Nothing here provides medical, legal or
  other professional advice.

## Next step

Wire up the platform for real: authenticated API + database for personas and
sessions, knowledge ingestion and retrieval, an LLM with per-persona system
prompts, speech-to-text and text-to-speech, and conversation memory.


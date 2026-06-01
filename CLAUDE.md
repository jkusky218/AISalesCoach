# CLAUDE.md — AI Sales Coach Project Brief

## What is AI Sales Coach?

AI Sales Coach is an AI-powered pre-sales flight simulator — a voice-enabled role-play training tool for ServiceNow Solution Architects. Coaches (SA leaders) and individual SAs practice customer conversations with AI-powered customer personas that push back, ask tough questions, and react realistically. After each session, the AI provides a detailed performance debrief with scoring, strengths, improvements, and coaching tips.

Built by Joey Kusky, Sr. Manager of Solutions Architecture at ServiceNow (2025 Global SC Leader of the Year).

**Tagline:** "Pilots don't learn to fly by reading manuals. Your SAs shouldn't learn to sell by reading release notes."

## Core Experience

### Session Flow
1. **Scenario Selection** — Pick from curated scenarios (vertical, product area, persona, difficulty)
2. **Briefing** — Read the situation, customer persona details, and your objectives
3. **Voice Role-Play** — Live conversation with an AI customer persona via voice (speak + listen) or text
4. **Debrief** — Detailed scorecard with skill ratings, objective tracking, strengths, improvements, missed opportunities, and coaching tips

### Voice Architecture
- **Voice Input**: Web Speech API (SpeechRecognition) — user speaks, browser transcribes
- **Voice Output**: Web Speech API (SpeechSynthesis) — customer persona speaks aloud
- **Fallback**: Full text input/output always available
- **CRITICAL**: Voice ONLY works when deployed as a standalone web app (not in iframes). This is why we need the PWA deployment — the prototype in Claude.ai artifacts couldn't access the microphone due to iframe sandbox restrictions.

### AI Behavior
- Claude plays the customer persona and stays fully in character
- Responses are concise (2-3 sentences) like a real executive on a call
- Personas have specific personalities, hot buttons, and triggers
- The AI pushes back, asks tough questions, and reacts to what the SA actually says
- For the debrief, Claude breaks character and evaluates as an expert pre-sales coach
- Scoring is returned as structured JSON for the scorecard UI

### Current Scenarios (T&L Vertical)

1. **Cold Discovery: Global Logistics VP** (Intermediate)
   - Jennifer Huang, VP CX at Meridian Freight Corp ($6B)
   - CSM focus, skeptical of platform vendors, data-driven
   
2. **Security Objection: Armis & Veza Play** (Advanced)
   - David Kowalski, CISO at Pacific Intermodal ($3.2B)
   - SecOps + Armis + Veza, competitive vs Palo Alto/CrowdStrike
   - Needs repositioning from "ticketing system" stigma

3. **Expansion: ITOM to Full Platform** (Advanced)
   - Robert Chen, CIO at TransGlobal Logistics ($9B)
   - ITOM → ITSM + HRSD + CSM expansion, CFO blocker
   
4. **Now Assist: Warehouse Operations** (Intermediate)
   - Maria Santos, VP Ops at Summit Distribution ($2.1B)
   - Now Assist + AI Agents, allergic to IT jargon, safety concerns

### ServiceNow Context
- Recent acquisitions: Veza (identity security, closed March 2026), Armis (OT/IoT asset discovery, closed April 2026), Moveworks (agentic AI, closed Dec 2025)
- Product areas: ITSM, ITOM, CSM, HRSD, Security Operations, Technology Workflows, Now Assist, AI Agents
- Vertical focus: Transportation & Logistics (expandable to Retail, Hospitality later)
- AI positioning: "AI Control Tower for Business Reinvention"

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | CSS-in-JS (dark theme, flight simulator aesthetic) |
| AI | Anthropic Claude API (Sonnet for role-play quality) |
| Voice In | Web Speech API (SpeechRecognition) |
| Voice Out | Web Speech API (SpeechSynthesis) |
| API Route | Vercel Serverless Function (keeps API key server-side) |
| PWA | vite-plugin-pwa + Workbox |
| Hosting | Vercel |
| Auth | None for MVP (add Supabase later for progress tracking) |

## Design Aesthetic

- **Theme**: Dark, flight simulator / cockpit feel
- **Primary**: Deep navy-black (#0A0E17) background
- **Accent**: Electric blue (#1A6BF5) for interactive elements
- **Fonts**: DM Sans (body), JetBrains Mono (labels, scores, technical text)
- **Scoring Colors**: Green (#10B981) ≥8, Yellow (#E8A817) ≥6, Red (#DC3545) <6
- **Difficulty**: Intermediate = Yellow, Advanced = Red
- **Animations**: fadeIn on screens, pulse on mic, waveform while listening
- **Mic States**: Red pulse when listening, blue pulse when customer speaking, yellow for thinking

## Project Structure

```
ai-sales-coach/
├── api/
│   └── chat.js              # Vercel serverless — proxies Claude API calls
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── AI Sales CoachPrototype.jsx  # Full working prototype (reference)
│   ├── lib/
│   │   └── ai.js             # Claude API client helper
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── CLAUDE.md                  # This file
├── README.md
├── package.json
├── vercel.json
└── vite.config.js
```

## API Architecture

The Claude API key must stay server-side. The flow is:

1. Frontend sends message + conversation history to `/api/chat`
2. Vercel serverless function adds the API key and calls Claude
3. Response returns to frontend
4. For role-play: use Sonnet model for persona quality
5. For debrief: use Sonnet with structured JSON output instructions

The serverless function handles two modes:
- **roleplay**: System prompt = persona prompt, conversational responses
- **debrief**: Evaluation prompt, returns JSON scorecard

## Environment Variables

```
ANTHROPIC_API_KEY=your-key-here
```

That's it for MVP. No database needed yet.

## Current State

- ✅ Full interactive prototype built with 4 scenarios
- ✅ Voice input (SpeechRecognition) and voice output (SpeechSynthesis) implemented
- ✅ Live transcript preview while speaking
- ✅ Real Claude API calls for role-play and debrief
- ✅ Structured JSON scoring with 5 skill categories
- ✅ Objective tracking (met/partial/missed)
- ✅ Coaching tips and missed opportunity analysis
- ✅ Voice toggle (mute/unmute)
- ✅ Text input fallback
- ⬜ Deploy as standalone PWA (microphone access requires it)
- ⬜ Vercel serverless function (API key currently exposed in prototype)
- ⬜ Progress tracking / session history
- ⬜ Additional verticals (Retail, Hospitality)
- ⬜ Additional scenarios
- ⬜ Spaced repetition for weak areas

## Phase Plan

### Phase 1: Deploy as PWA (CURRENT)
- Scaffold project with Vite + React
- Move prototype into component architecture
- Create Vercel serverless function for Claude API (move API key server-side)
- Deploy to Vercel
- Verify voice input/output works on deployed version
- PWA manifest + service worker for installability

### Phase 2: Polish
- Session history (localStorage for now)
- Streamed responses (show customer typing in real-time)
- Better voice selection (pick from available voices)
- Timer per session
- Conversation transcript export (PDF or markdown)

### Phase 3: Scale
- Supabase for user accounts and progress tracking
- More verticals (Retail, Hospitality)
- More scenarios per vertical
- Spaced repetition — resurface topics the SA struggled with
- Team leaderboard (optional, for competitive SAs)
- Custom scenario builder (upload your own persona prompts)

## Key Design Decisions

1. **Sonnet over Haiku for role-play** — Persona quality matters. A CISO who pushes back realistically needs Sonnet-level reasoning. Haiku is too thin for nuanced character work.
2. **Voice-first but text-always** — Voice is the primary input for realism, but text is always available as fallback.
3. **No auth for MVP** — Get it working and usable first. Add accounts when there's a reason to track progress.
4. **Serverless function for API** — Never expose the API key in frontend code. Vercel serverless functions are the right pattern.
5. **Dark theme** — Flight simulator aesthetic. Serious tool, not playful. This is training, not a game.
6. **Structured JSON for scoring** — Makes the debrief UI deterministic. The AI returns scores as numbers, not prose.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (voice works on localhost!)
npm run build        # Production build
npm run preview      # Preview production build
```

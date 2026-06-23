# AI Interviewer

A web app for practicing technical interviews against an AI interviewer that
asks subject-specific questions, follows up intelligently based on your
answers, and generates a scored report at the end.

## Why this exists

Built to support my own placement prep (DSA, OOP, DBMS, etc.) — practicing
out loud with instant, structured feedback is harder to get than just
solving problems silently. Scoped as a real project rather than a quick
script because the interesting engineering problem (managing multi-turn
interview state and turning free-text answers into structured scoring) is
worth doing properly.

## Architecture

- **Next.js (App Router)** — frontend and backend (API routes) in a single
  deployable unit. No separate server to manage at this scale.
- **Gemini API (`gemini-1.5-flash`)** — generates questions, follow-ups, and
  the final report. Chosen over OpenAI for free-tier access without a card.
- **Tailwind CSS** — utility-first styling, fast to iterate on with limited
  time.

### Key design decisions

- All Gemini calls are routed through a single client (`lib/gemini.ts`) so
  the API key and model config live in exactly one place.
- The interview is modeled as explicit state (subject, question history,
  answers, follow-up count) rather than letting the LLM freely improvise —
  this keeps it from drifting off-subject or repeating itself.
- The final report is generated via a structured-output prompt (the model
  is asked to return JSON matching a fixed schema), which is validated
  before being rendered — not just displayed as raw model text.

## Status

This is an MVP, scoped deliberately small to ship something complete rather
than many things half-finished:

**Built:**
- [ ] Subject selection
- [ ] Interview loop (question -> answer -> follow-up/next)
- [ ] Structured report generation (scores, strengths, weaknesses)

**Explicitly out of scope for this version (roadmap, not abandoned):**
- Voice input/output
- AI avatar / video
- Webcam-based eye contact / posture analysis
- Live coding round
- Resume parsing for personalized questions
- Company-specific interview modes
- Multi-session analytics dashboard

These are cut deliberately, not because they weren't considered — building
all of them at once was the original idea, but it traded a finished product
for an unfinished one. They're a reasonable v2 roadmap.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # then add your Gemini API key
npm run dev
```

Get a free Gemini API key at https://aistudio.google.com/app/apikey

## Deployment

Deployed on Vercel. Push to GitHub, import the repo on vercel.com, add
`GEMINI_API_KEY` as an environment variable in the Vercel project settings.

# InterviewPilot AI

**Be prepared for every question.** Your AI-powered interview strategist for remote and global careers.

InterviewPilot is not a chatbot. It understands, at the same time, **who you are** (your resume), **what the company wants** (the job and company research), **what the interviewer is asking** (question analysis) and **how you should answer** (personalized, truthful answers) — and it keeps every interview's context in memory.

> Use the Interview Copilot in real interviews **only when AI assistance is permitted by the selection process**. InterviewPilot runs as a *Separate Copilot Workspace* and includes no mechanisms to bypass proctoring, anti-cheating tools, or monitoring software.

## Features (MVP)

| Area | What you get |
| --- | --- |
| **Candidate Knowledge Base** | Upload PDF / DOCX / TXT or paste your resume. Experience, education, skills, languages and projects are extracted into an editable knowledge base. Files are parsed in the browser. |
| **Job Analyzer** | Paste, upload or fetch a public URL. Extracts title, seniority, responsibilities, must-have / nice-to-have, skills, keywords, competencies, *What the company is looking for* and *What the interviewer is likely to ask*. |
| **Resume ↔ Job Match** | Overall score plus Experience / Skills / Education / Language / Requirements, strong matches with evidence, potential gaps and recommended talking points. Computed locally; optionally enriched by AI. |
| **Company Intelligence** | Overview, products, industry, values, culture, role expectations, likely topics, potential questions and a grounded *Why do you want to work here?* |
| **Interview Copilot (Mode B)** | Each question is classified (type, interviewer intent, what is being evaluated), matched to your relevant experience, and answered with **Quick / Natural / Strong** versions. Key points appear first; the answer streams in. Buttons: Shorter, More Natural, More Confident, More Professional, Use STAR, Regenerate. Follow-up prediction after every answer. |
| **Answer From My Experience** | The engine searches your knowledge base for the most relevant experience and structures it as Situation / Task / Action / Result before turning it into a natural answer. |
| **Private Copilot Window** | Opens in its own resizable, movable window (`#/copilot/:id`) that you can move to another display, minimize and restore. Context is shared with the main app. Never embedded in the video-call window. |
| **Ultra Compact Mode** | Question · Key points · Answer · Follow-up only. |
| **Keyboard shortcuts** | Configurable, app-scoped only: `Ctrl+Enter` generate, `Ctrl+Shift+S` shorter, `Ctrl+Shift+N` natural, `Ctrl+Shift+F` professional, `Ctrl+Shift+*` STAR, `Esc` minimize. |
| **Mock Interview (Mode A)** | AI interviewer (behavioral, technical, HR, hiring manager, English, mixed), one question at a time, 0–100 score on nine dimensions, feedback, improved answer, and a final Interview Performance Report. |
| **English Interview Coach** | Grammar, vocabulary, fluency, naturalness, professional English, filler words, corrections and a more natural version. |
| **Challenge Solver** | Math, logic, Excel, SQL, programming, data analysis, translation, grammar, writing, classification, AI evaluation, annotation, prompt evaluation, case studies, business problems — by text or image. Returns UNDERSTAND → APPROACH → SOLUTION → FINAL ANSWER → EXPLANATION. |
| **Interview Memory** | Every interview keeps company, job, resume, questions, answers, feedback, strengths and weaknesses. Smart memory avoids repeating experiences within an interview. |
| **Dashboard & Performance** | Interviews practiced, questions answered, average score, strongest skills, skills to improve, readiness, radar and trend charts. |
| **Candidate Profile** | Communication style, answer length, preferred language (EN / PT / ES / IT). |
| **Privacy** | Local-only storage, Delete Resume / Interview / Profile / All Data, JSON export, and a clear explanation of how data is processed. |
| **Anti-hallucination** | Hard rule in every prompt and in the offline engine: never invent companies, roles, experiences, certifications, tools, projects, results or clients. When information is missing the answer is *"I don't have enough information from your profile to answer this accurately."* |

## Running locally

```bash
cp .env.example .env      # add ANTHROPIC_API_KEY for the server proxy (recommended)
npm install
npm run dev               # web on http://localhost:5173 + API proxy on :8787
npm run build             # production build in dist/
npm start                 # serves dist/ and the API from one process (NODE_ENV=production)
```

### AI engines

Choose in **Settings → AI engine**:

1. **Server proxy (recommended)** — the browser calls `/api/*`; the Node server holds `ANTHROPIC_API_KEY`. Stateless, logs nothing.
2. **Browser (bring your own key)** — calls the Anthropic API directly from the browser; the key is stored only in that browser.
3. **Offline engine** — a deterministic heuristic engine with no model. Private and instant, lower quality, still never invents facts. This is the default so the app is usable immediately (including on static hosting such as GitHub Pages).

Default model: `claude-opus-5` (main and fast paths), configurable in Settings. The proxy uses streaming for answers and structured outputs (JSON schema) for analysis.

## Architecture

```
shared/ai-contract.ts        request/response types shared by client and server
server/index.ts              Express proxy: /api/health, /api/ai/stream (SSE), /api/ai/json, /api/fetch-url
src/
  lib/types.ts               domain model (knowledge base, job, match, company, interview, mock, challenge, profile, settings)
  lib/ai/
    engine.ts                AIEngine interface — the product-level AI API
    llmEngine.ts             Claude implementation (prompts + schemas over a transport)
    offlineEngine.ts         heuristic implementation (no model)
    transport.ts             ServerTransport (proxy) and BrowserTransport (BYOK)
    prompts.ts / schemas.ts  system prompts (anti-hallucination) and JSON schemas
    context.ts               InterviewContext serialization + interview memory
  lib/match.ts               local resume ↔ job scoring
  lib/parsers.ts             PDF (pdf.js) / DOCX (mammoth) / URL text extraction
  lib/shortcuts.ts           app-scoped keyboard shortcuts
  lib/copilotWindow.ts       separate Copilot window management
  store/useStore.ts          zustand store, persisted to localStorage, synced across windows
  components/copilot/        Copilot panel + orchestration hook (parallel key points + streamed answers)
  pages/                     Landing, Dashboard, Interviews, InterviewDetail, CopilotWindow, MockInterviews,
                             MockSession, Resume, Jobs, JobDetail, Challenges, Performance, CompanyResearch, Settings
```

The engine/transport split is what makes the roadmap possible: new models are new transports or engine options, a desktop app (Electron/Tauri) reuses the Copilot window route, speech-to-text plugs into the Copilot input, and a SaaS backend replaces the localStorage persistence layer behind the same store API.

## Roadmap (structured for)

Real-time transcription · audio / speech-to-text · voice and pronunciation analysis · multiple AI models · browser extension · desktop and mobile apps · multiple resumes and job profiles (already supported in the store) · interview analytics · subscription plans (Free / Pro / Premium) · interview question database.

## Previous projects in this repository

- `estuda/` — Estuda, academic productivity platform (React + Vite), preserved.
- `atc-voice/` — ATC Voice PWA, preserved.

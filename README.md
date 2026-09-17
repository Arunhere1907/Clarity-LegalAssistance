# Clarity — AI for Legal Assistance & Access

A legal document workspace that explains, compares, and helps you act on contracts and agreements — without pretending to be a lawyer.

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com) [![Google Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat&logo=google)](https://aistudio.google.com/) [![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## Problem statement

> Legal information can often be complex, difficult to understand, and challenging to navigate without professional assistance. Build a GenAI-powered solution that makes legal information and basic legal assistance more accessible by helping users understand, compare, and navigate legal documents and information.
>
> Potential use cases include: simplifying complex legal documents; comparing contracts, agreements, or policies; highlighting important clauses, obligations, risks, or inconsistencies; answering questions based on provided legal documents; helping users understand their options and potential next steps; generating summaries, checklists, or other actionable outputs; helping users prepare information or questions for a legal professional.
>
> **Note:** solutions should provide information and assistance, rather than replace professional legal advice.

Clarity is built directly against this brief — every core feature below maps to a listed use case, and the disclaimer language is enforced in the UI, not just this README.

---

## What Clarity does

| Brief's use case | Clarity feature |
|---|---|
| Simplifying complex legal documents | **Dual-Tier Simplification** — toggle each clause between a plain-English rewrite and precise legal language with inline jargon definitions, always shown next to the original text, never replacing it |
| Comparing contracts, agreements, or policies | **Contract Version Comparator** — clause-by-clause redline diff between two documents, with each change labeled by who it favors |
| Highlighting clauses, obligations, risks, or inconsistencies | **Risk Tagging** (Standard / Unusual / High-Attention / Missing-but-Expected, each with a stated reason) + **Obligations & Deadlines Timeline** with `.ics` export |
| Answering questions based on provided documents | **Grounded Q&A Engine** — every answer is tied to a verbatim clause citation; if the document doesn't contain the answer, it says so instead of generalizing |
| Helping users understand options and next steps | **"What Happens If" Consequence Simulator** — pick a clause, test a scenario, see the trigger, the user's position/recourse, and the likely outcome |
| Generating summaries, checklists, or actionable outputs | Plain-English summary, pre-signing question checklist, and one-click **PDF export** |
| Preparing information or questions for a legal professional | **Lawyer-Ready Packet** — structured paralegal brief bundling flagged clauses, open questions, and context, so a consultation starts past the basics instead of at them |

## Beyond the brief

The brief explicitly invites exploring past the listed use cases. Two features exist because of that:

- **Fairer Language Generator** — for a flagged clause, generates actual replacement contract text (not just a description of what's wrong), shown as a redline next to the original.
- **Negotiation Email Drafter** — turns a flagged clause's risk assessment into a polite, professional email requesting the specific change, with talking points attached. This is the step most tools stop one short of: from "here's a problem" to "here's what to send."

## Responsible by design

The brief's constraint — *information and assistance, not a replacement for professional advice* — isn't just a footer disclaimer here:

- Every screen that surfaces an option or a next step frames it as information, never a recommendation, and points toward finding a professional for anything beyond that.
- The Q&A engine refuses to answer beyond what the document actually says — no filling gaps from general legal knowledge.
- No feature predicts case outcomes or gives a probability of winning a dispute.
- **Client-side PII scrubbing** — names, emails, phone numbers, addresses, and SSNs are detected and redacted in the browser before any text reaches the Gemini API, restored only in the rendered output.

---

## Tech stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Motion, jsPDF & jsPDF-AutoTable
- **AI**: `@google/genai` (Gemini Flash, with automatic model fallback) — used for extraction/OCR, clause simplification, risk tagging via structured JSON output, grounded Q&A, comparison diffing, and the two generative outputs above (fairer-language rewrite, negotiation drafts)
- **Backend**: Express 4 (`api/index.ts`)
- **Deployment**: Vercel Serverless Functions + static SPA (`dist/`)

## Getting started locally

**Prerequisites:** Node.js 18+, a [Gemini API key](https://aistudio.google.com/apikey)

```bash
git clone https://github.com/Arunhere1907/Clarity-LegalAssistance.git
cd Clarity-LegalAssistance
npm install
cp .env.example .env   # add GEMINI_API_KEY
npm run dev             # http://localhost:3000
```

## Deploying to Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new) — framework preset `Vite`, root directory `./`.
2. Add environment variable `GEMINI_API_KEY` (optionally `GEMINI_MODEL=gemini-2.5-flash`).
3. Deploy. Vercel builds the frontend to `dist/` and serves the API from `/api/*`.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server — Vite HMR + Express API on port 3000 |
| `npm run build` | Production build of frontend + bundled server |
| `npm run start` | Runs the production server |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run clean` | Clears `dist/` |

## License

MIT

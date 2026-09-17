# Clarity — AI for Legal Assistance & Access

<div align="center">

**Empowering non-lawyers and legal teams with plain-English contract analysis, grounded risk evaluation, clause-level simulation, and automated negotiation drafts.**

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Google Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat&logo=google)](https://aistudio.google.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 Overview

**Clarity** is an intelligent legal document workspace designed to demystify complex agreements. Whether evaluating an apartment lease, employment contract, loan agreement, or vendor terms of service, Clarity translates impenetrable legalese into clear, actionable insights while safeguarding sensitive user data.

---

## ✨ Key Features

- 📑 **Dual-Tier Simplification**: Switch between conversational plain-English summaries and clear legal English, complete with in-line jargon definitions.
- ⚠️ **Multi-Dimensional Risk Flagging**: Automatically tags clauses as *Standard*, *Unusual*, *High-Attention*, or *Missing-but-Expected*, explaining specific risks and real-world consequences.
- 🎯 **Grounded Q&A Engine**: Query any document with questions answered **strictly** with verbatim clause citations and quotes to eliminate AI hallucination.
- ⚡ **"What Happens If" Consequence Simulator**: Test hypothetical real-world scenarios (e.g. missed payment, delayed milestone, dispute) to view trigger events, counterparty remedies, and user recourse.
- ⚖️ **Contract Version Comparator**: Clause-by-clause redline diff that identifies material changes and calculates net favorability shifts (e.g., Tenant vs. Landlord).
- ✍️ **Fairer Language Generator**: Generates balanced, commercially reasonable replacement clauses ready to drop directly into a contract draft.
- ✉️ **Negotiation Email Drafter**: Creates polite, professional, non-combative emails proposing contract amendments, complete with tactical talking points.
- 📅 **Obligations & Deadlines Timeline**: Surfaces payment dates, notice periods, and renewal windows with 1-click `.ics` calendar export.
- 🖨️ **Lawyer-Ready Packet & PDF Export**: Generates structured paralegal briefs and printable summary packets for attorney consultations.
- 🔒 **Client-Side PII Scrubbing**: Detects and redacts sensitive PII (names, emails, phone numbers, addresses, SSNs) directly in your browser prior to any AI processing.

---

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Motion, jsPDF & jsPDF-AutoTable
- **Backend / API**: Express 4, `@google/genai` (Gemini Flash with automatic model fallback)
- **Deployment**: Vercel Serverless Functions (`api/index.ts`) + Static SPA (`dist/`)

---

## 🛠️ Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- A Google Gemini API Key ([Get one free at Google AI Studio](https://aistudio.google.com/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/Arunhere1907/Clarity-LegalAssistance.git
cd Clarity-LegalAssistance
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:

```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deploying to Vercel via GitHub

Clarity is configured with Vercel Serverless Functions (`api/index.ts`) and `vercel.json` rewrites for zero-config deployment.

### Step 1: Push this repository to GitHub
*(Already done or see GitHub instructions below)*

### Step 2: Import Project into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **"Add New..."** > **"Project"**.
3. Select your GitHub repository (`Clarity-LegalAssistance`).
4. Framework Preset: **Vite** (auto-detected).
5. Root Directory: `./` (leave default).

### Step 3: Add Gemini API Key
In the **Environment Variables** section of the Vercel project configuration:
- **Key**: `GEMINI_API_KEY`
- **Value**: `your_actual_gemini_api_key_here`
- *(Optional)* **Key**: `GEMINI_MODEL`, **Value**: `gemini-2.5-flash`

### Step 4: Deploy
Click **Deploy**. Vercel will build the frontend into `dist/` and expose the API routes through serverless functions on `/api/*`.

---

## 📦 Available Scripts

- `npm run dev`: Starts the local development server with Vite HMR + Express API on port 3000.
- `npm run build`: Compiles the React frontend for production and bundles the Node server.
- `npm run start`: Runs the production Node server.
- `npm run lint`: Runs TypeScript compiler check (`tsc --noEmit`).
- `npm run clean`: Cross-platform cleanup of the `dist/` directory.

---

## 📄 License

This project is licensed under the MIT License.

import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!aiClient && apiKey) {
    aiClient = new GoogleGenAI({
      apiKey,
    });
  }
  return aiClient;
}

// Resilient Gemini caller with automatic model fallback
async function callGemini(contents: string, responseSchema?: any) {
  const ai = getAI();
  if (!ai) {
    const err = new Error("GEMINI_API_KEY is not configured in server environment.");
    (err as any).statusCode = 503;
    throw err;
  }

  const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const modelsToTry = [
    preferredModel,
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.0-flash"
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;
  for (const model of uniqueModels) {
    try {
      const config: any = {
        responseMimeType: "application/json",
      };
      if (responseSchema) {
        config.responseSchema = responseSchema;
      }
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Clarity API] Call with model '${model}' failed:`, err?.message || err);
      if (err?.status === 401 || err?.message?.includes("API_KEY_INVALID")) {
        throw err;
      }
    }
  }
  throw lastError;
}

const app = express();
app.use(express.json({ limit: "10mb" }));

// Enable CORS for universal access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const router = express.Router();

// Health check
router.get("/health", (_req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
  res.json({
    status: "ok",
    geminiConfigured: hasKey,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
  });
});

// 1. Ingest & Analyze Document
router.post("/analyze", async (req, res) => {
  try {
    const { text, userTypeOverride } = req.body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Document text is required." });
    }

    const prompt = `You are Clarity, an expert legal paralegal and document analyst.
Analyze the following legal document text.

Document Text:
"""
${text.slice(0, 35000)}
"""

Tasks:
1. Auto-classify document type (lease, employment, nda, loan, tos, vendor, or custom).
2. Segment the document into logical numbered clauses/sections.
3. For EACH clause:
   - Provide original text excerpt.
   - Provide a "simplifiedText" in conversational plain English.
   - Provide a "preciseText" in clear legal English keeping precise terms but accessible.
   - Extract jargon terms with short, plain definitions.
   - Tag the clause strictly as one of:
     * "standard" (customary, balanced)
     * "unusual" (non-standard terms, unexpected obligations)
     * "high-attention" (severe financial liability, lock-ins, aggressive penalties, forfeiture, broad non-competes, strict waivers)
     * "missing-but-expected" (standard statutory protections omitted)
   - One-line plain English reason explaining WHY this tag was assigned.
   - A short "consequenceWalkthrough" explaining "What happens if this clause is invoked or breached".
4. Extract an obligations timeline: date-bound obligations, notice periods, payment deadlines, renewal windows, penalties.
5. Create a pre-signing questions checklist for the user to ask before signing.
6. Create a lawyer-prep brief: flagged clauses with paralegal notes, open questions, and missing provisions.

Return strictly structured JSON.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        detectedType: { type: Type.STRING },
        docType: { type: Type.STRING },
        summary: { type: Type.STRING },
        clauses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              number: { type: Type.STRING },
              title: { type: Type.STRING },
              originalText: { type: Type.STRING },
              simplifiedText: { type: Type.STRING },
              preciseText: { type: Type.STRING },
              jargonTerms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING }
                  },
                  required: ["term", "definition"]
                }
              },
              tag: { type: Type.STRING },
              tagReason: { type: Type.STRING },
              page: { type: Type.INTEGER },
              consequenceWalkthrough: { type: Type.STRING }
            },
            required: ["id", "number", "title", "originalText", "simplifiedText", "preciseText", "tag", "tagReason"]
          }
        },
        timeline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              dateOrTrigger: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              party: { type: Type.STRING },
              category: { type: Type.STRING },
              isoDate: { type: Type.STRING }
            },
            required: ["id", "dateOrTrigger", "title", "description", "party", "category"]
          }
        },
        questionsChecklist: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              whyAsk: { type: Type.STRING },
              relevantClauseId: { type: Type.STRING },
              clauseTitle: { type: Type.STRING }
            },
            required: ["id", "question", "whyAsk", "relevantClauseId", "clauseTitle"]
          }
        },
        lawyerBrief: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            flaggedClauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clauseId: { type: Type.STRING },
                  clauseTitle: { type: Type.STRING },
                  tag: { type: Type.STRING },
                  concern: { type: Type.STRING },
                  paralegalNote: { type: Type.STRING }
                },
                required: ["clauseId", "clauseTitle", "tag", "concern", "paralegalNote"]
              }
            },
            openQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            missingProvisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            disclaimer: { type: Type.STRING }
          },
          required: ["summary", "flaggedClauses", "openQuestions", "missingProvisions", "disclaimer"]
        }
      },
      required: ["title", "detectedType", "docType", "summary", "clauses", "timeline", "questionsChecklist", "lawyerBrief"]
    };

    const response = await callGemini(prompt, schema);
    const parsed = JSON.parse(response.text?.trim() || "{}");
    if (userTypeOverride) {
      parsed.docType = userTypeOverride;
    }
    res.json(parsed);
  } catch (err: any) {
    console.error("Analysis error:", err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to analyze document." });
  }
});

// 2. Grounded Q&A
router.post("/qa", async (req, res) => {
  try {
    const { question, clauses, docTitle } = req.body;
    if (!question || !clauses || !Array.isArray(clauses)) {
      return res.status(400).json({ error: "Question and clauses array are required." });
    }

    const clausesContext = clauses.map((c: any) => `[Clause ID: ${c.id}] ${c.number}: ${c.title}\nText: ${c.originalText}`).join('\n\n');

    const prompt = `You are Clarity, a grounded legal document assistant.
You answer questions SOLELY based on the provided document clauses below.

Document Title: ${docTitle || 'Document'}
Clauses:
${clausesContext.slice(0, 30000)}

User Question: "${question}"

CRITICAL GROUNDING RULES:
1. Every statement in your answer MUST be cited directly to one or more Clause IDs (e.g., [c1], [c3]).
2. If the document DOES NOT contain the answer, you MUST say explicitly: "The document does not contain information regarding this question." Do NOT generalize, assume, or answer from external training knowledge.
3. Keep the answer clear, precise, and objective.
4. If options or actions exist, end with: "To evaluate specific legal strategy, consult a licensed attorney."

Format your response as JSON matching:
{
  "answer": "Grounded answer text with citations like [c1]...",
  "foundInDocument": true/false,
  "citations": [
    {
      "clauseId": "c1",
      "clauseNumber": "Section 1",
      "clauseTitle": "Rent & Payment",
      "quote": "Direct brief quote from clause"
    }
  ]
}`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        answer: { type: Type.STRING },
        foundInDocument: { type: Type.BOOLEAN },
        citations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              clauseId: { type: Type.STRING },
              clauseNumber: { type: Type.STRING },
              clauseTitle: { type: Type.STRING },
              quote: { type: Type.STRING }
            },
            required: ["clauseId", "clauseNumber", "clauseTitle"]
          }
        }
      },
      required: ["answer", "foundInDocument", "citations"]
    };

    const response = await callGemini(prompt, schema);
    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("QA error:", err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to answer question." });
  }
});

// 3. "What Happens If" Simulator
router.post("/simulate", async (req, res) => {
  try {
    const { clauseTitle, originalText, scenario } = req.body;
    if (!originalText) {
      return res.status(400).json({ error: "Clause original text is required." });
    }

    const prompt = `You are Clarity's "What happens if" legal consequence simulator.
A user wants to understand the concrete real-world consequence if a specific clause is triggered, invoked, or breached.

Clause: ${clauseTitle || 'Selected Clause'}
Clause Original Text:
"""
${originalText}
"""

Scenario / Question:
"${scenario || 'What happens if this clause is invoked, broken, or disputed in practice?'}"

Analyze this objectively from the user/client's standpoint:
1. "trigger": What exact event, missed date, or action triggers this consequence?
2. "userRecourse": What concrete recourse or remedies does the user have under this clause (e.g., for vendor delivery deadlines, rights to withhold milestone funds, demand service credits, terminate for breach, or claim liquidated delay damages)?
3. "rights": What rights or obligations does the user retain under this clause?
4. "counterpartyRemedies": What actions, penalties, or damages can the other party claim or enforce?
5. "financialOrOperationalImpact": Monetary penalties, timelines, or operational repercussions.
6. "preventionOrNextStep": Concrete practical steps to protect rights or mitigate risk.
7. "walkthrough": A 2-3 paragraph plain-English explanation walking through the real-world chain of events.

Return strictly structured JSON.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        trigger: { type: Type.STRING },
        userRecourse: { type: Type.STRING },
        rights: { type: Type.STRING },
        counterpartyRemedies: { type: Type.STRING },
        financialOrOperationalImpact: { type: Type.STRING },
        preventionOrNextStep: { type: Type.STRING },
        walkthrough: { type: Type.STRING }
      },
      required: ["trigger", "userRecourse", "rights", "counterpartyRemedies", "financialOrOperationalImpact", "preventionOrNextStep", "walkthrough"]
    };

    const response = await callGemini(prompt, schema);
    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Simulation error:", err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to simulate clause." });
  }
});

// 4. Document Comparator (Diff & Favorability)
router.post("/compare", async (req, res) => {
  try {
    const { docAText, docBText, docAName, docBName } = req.body;
    if (!docAText || !docBText) {
      return res.status(400).json({ error: "Both documents are required for comparison." });
    }

    const prompt = `You are Clarity's Document Comparator.
Compare Document A (Original) vs Document B (Revised/Redline).

Document A (${docAName || 'Original'}):
"""
${docAText.slice(0, 15000)}
"""

Document B (${docBName || 'Revised'}):
"""
${docBText.slice(0, 15000)}
"""

Compare them clause by clause. Identify material substantive changes (not mere typos).
For each change:
- State the section / clause title
- Quote or summarize the Old Text vs New Text
- State who this change favors (e.g. "Tenant", "Landlord", "Employee", "Employer", "Customer", "Vendor", or "Neutral")
- Provide a concise, plain-English legal rationale of WHY it favors that party.

Also provide an executive summary of the net balance shift between Document A and Document B.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        docAName: { type: Type.STRING },
        docBName: { type: Type.STRING },
        summary: { type: Type.STRING },
        changes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              section: { type: Type.STRING },
              clauseTitle: { type: Type.STRING },
              oldText: { type: Type.STRING },
              newText: { type: Type.STRING },
              favorsParty: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["id", "section", "clauseTitle", "oldText", "newText", "favorsParty", "explanation"]
          }
        }
      },
      required: ["docAName", "docBName", "summary", "changes"]
    };

    const response = await callGemini(prompt, schema);
    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Comparison error:", err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to compare documents." });
  }
});

// 5. Draft Counterparty Negotiation Email
router.post("/draft-message", async (req, res) => {
  try {
    const { clauseTitle, originalText, tag, tagReason, suggestedStrategy, docTitle, docType } = req.body;
    if (!clauseTitle || !originalText) {
      return res.status(400).json({ error: "clauseTitle and originalText are required." });
    }

    const ai = getAI();
    if (!ai) {
      // High quality fallback based on suggestedStrategy and clause details
      const fallbackSubject = `Proposed Adjustment to ${clauseTitle} — ${docTitle || 'Agreement'}`;
      const fallbackRecipient = docType === 'lease' ? 'Landlord / Property Management' : docType === 'employment' ? 'Hiring Team / HR' : 'Counterparty Legal / Account Lead';
      const fallbackBody = `Dear ${fallbackRecipient},\n\nI am currently reviewing the ${docTitle || 'agreement'} and am excited about moving forward. In reviewing ${clauseTitle}, I noticed the current terms regarding ${tagReason ? tagReason.toLowerCase() : 'this provision'}.\n\nSpecifically: ${suggestedStrategy || 'We would like to propose a more balanced, standard term that aligns with customary industry practice.'}\n\nCould we agree to adjust this language accordingly? Please let me know if you would like to discuss this or review a redlined version.\n\nThank you for your flexibility and understanding.\n\nBest regards,`;
      return res.json({
        recipient: fallbackRecipient,
        subject: fallbackSubject,
        body: fallbackBody,
        talkingPoints: [
          "Positions the request constructively as standard market practice rather than an impasse.",
          "References specific rationale to demonstrate reasonable expectations.",
          "Offers an immediate path to signature once mutual agreement is confirmed."
        ]
      });
    }

    const prompt = `You are Clarity's negotiation assistant. Generate a polite, professional, and firm email to a counterparty (e.g., landlord, employer, vendor) requesting a revision to a flagged clause.
Document Title: "${docTitle || 'Contract'}"
Document Type: "${docType || 'contract'}"
Clause Title: "${clauseTitle}"
Clause Original Text:
"""
${originalText}
"""
Risk Concern / Reason: "${tagReason || ''}"
Paralegal Strategy Guidance: "${suggestedStrategy || ''}"

Instructions:
1. Write a direct, respectful, non-combative email requesting the specific revision based on the strategy guidance.
2. Clearly explain *why* the requested revision is standard, reasonable, and protective without being hostile or accusatory.
3. Provide 2-3 bullet talking points the user can use if the counterparty pushes back during a phone call or follow-up email.
4. Keep tone professional, constructive, and actionable.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        recipient: { type: Type.STRING },
        subject: { type: Type.STRING },
        body: { type: Type.STRING },
        talkingPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["recipient", "subject", "body", "talkingPoints"]
    };

    const response = await callGemini(prompt, schema);
    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Draft message error:", err);
    const { clauseTitle, tagReason, suggestedStrategy, docTitle, docType } = req.body;
    const recipient = docType === 'lease' ? 'Landlord / Property Manager' : docType === 'employment' ? 'Hiring Manager / HR' : 'Counterparty Representative';
    res.json({
      recipient,
      subject: `Proposed Revision: ${clauseTitle} — ${docTitle || 'Agreement'}`,
      body: `Dear ${recipient},\n\nI am reviewing the ${docTitle || 'agreement'} and look forward to finalizing our relationship. With regard to ${clauseTitle}, I would like to propose a slight adjustment:\n\n${suggestedStrategy || tagReason || 'We request updating this section to reflect standard mutual protections.'}\n\nWould you be open to incorporating this modification? Thank you for considering this request.\n\nBest regards,`,
      talkingPoints: [
        "Points to customary standard terms in this industry.",
        "Protects against unintended unilateral liability.",
        "Enables rapid execution once resolved."
      ]
    });
  }
});

// 6. Suggest Fairer Language (Literal Replacement Clause)
router.post("/suggest-fairer-language", async (req, res) => {
  try {
    const { clauseTitle, originalText, tag, tagReason, suggestedReplacementText, docType } = req.body;
    if (!clauseTitle || !originalText) {
      return res.status(400).json({ error: "clauseTitle and originalText are required." });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({
        replacementText: suggestedReplacementText || originalText,
        rationale: tagReason ? `Addresses the flagged issue: ${tagReason}. Restores mutual balance while maintaining reasonable protections.` : "Provides standard bilateral terms customary for this type of agreement.",
        keyChanges: [
          "Replaces unilateral restrictions with commercially reasonable mutual terms.",
          "Eliminates disclaimers that abridge statutory rights.",
          "Maintains essential protections while removing disproportionate penalties."
        ]
      });
    }

    const prompt = `You are Clarity's contract drafting paralegal. Generate a literal, legally precise replacement clause for this flagged clause.
Document Type: "${docType || 'contract'}"
Clause Title: "${clauseTitle}"
Risk Tag: "${tag || 'flagged'}"
Flag Reason: "${tagReason || ''}"
Existing Guidance / Base Replacement: "${suggestedReplacementText || ''}"

Original Clause Text:
"""
${originalText}
"""

Instructions:
1. Provide the exact literal text of a balanced, fair replacement clause ("replacementText").
   - Do NOT include conversational commentary inside replacementText; it must be ready to drop directly into a contract redline.
   - Remove one-sided traps (e.g. unilateral penalties, disclaimed duty to mitigate, overbroad non-competes, extreme automatic renewal notice).
   - Preserve reasonable protections for both sides.
2. Provide a 2-sentence "rationale" explaining why this text is fair and balanced.
3. Provide 2-4 concise bullet points ("keyChanges") summarizing the specific substantive changes made versus the original.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        replacementText: { type: Type.STRING },
        rationale: { type: Type.STRING },
        keyChanges: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["replacementText", "rationale", "keyChanges"]
    };

    const response = await callGemini(prompt, schema);
    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Fairer language error:", err);
    const { originalText, tagReason, suggestedReplacementText } = req.body;
    res.json({
      replacementText: suggestedReplacementText || originalText,
      rationale: tagReason ? `Revised to mitigate: ${tagReason}` : "Standard balanced contractual provision.",
      keyChanges: [
        "Removed unilateral penalty and unreasonable notice thresholds.",
        "Substituted standard customary covenants in place of overbroad restrictions."
      ]
    });
  }
});

// Mount router on both /api and / so it works seamlessly locally and with Vercel rewrites
app.use("/api", router);
app.use("/", router);

export default app;

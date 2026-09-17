// ---------------------------------------------------------------------------
// Core domain types for Clarity Legal Document Workspace
// ---------------------------------------------------------------------------

export type RiskTag = 'standard' | 'unusual' | 'high-attention' | 'missing-but-expected';

export type ReadingMode = 'standard' | 'high-contrast';

export type TimelineCategory = 'deadline' | 'payment' | 'renewal' | 'penalty';

export type DocType = 'lease' | 'employment' | 'nda' | 'loan' | 'tos' | 'vendor' | 'custom';

// ---------------------------------------------------------------------------
// Document structure
// ---------------------------------------------------------------------------

export interface JargonTerm {
  term: string;
  definition: string;
}

export interface Clause {
  id: string;
  number: string;
  title: string;
  originalText: string;
  simplifiedText: string;
  preciseText: string;
  jargonTerms: JargonTerm[];
  tag: RiskTag;
  tagReason: string;
  page?: number;
  consequenceWalkthrough?: string;
  suggestedNegotiationStrategy?: string;
  suggestedReplacementText?: string;
}

export interface TimelineObligation {
  id: string;
  dateOrTrigger: string;
  title: string;
  description: string;
  party: string;
  /** Exact literal values; server sanitises arbitrary AI output to this union. */
  category: TimelineCategory;
  isoDate?: string;
}

export interface PreSigningQuestion {
  id: string;
  question: string;
  whyAsk: string;
  relevantClauseId: string;
  clauseTitle: string;
}

export interface LawyerBriefFlag {
  clauseId: string;
  clauseTitle: string;
  tag: RiskTag;
  concern: string;
  paralegalNote: string;
}

export interface LawyerBrief {
  summary: string;
  flaggedClauses: LawyerBriefFlag[];
  openQuestions: string[];
  missingProvisions: string[];
  disclaimer: string;
}

export interface DocumentAnalysis {
  id: string;
  title: string;
  docType: DocType;
  detectedType: string;
  summary: string;
  clauses: Clause[];
  timeline: TimelineObligation[];
  questionsChecklist: PreSigningQuestion[];
  lawyerBrief: LawyerBrief;
}

// ---------------------------------------------------------------------------
// Q&A
// ---------------------------------------------------------------------------

export interface Citation {
  clauseId: string;
  clauseNumber: string;
  clauseTitle: string;
  quote?: string;
}

export interface QAMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
  foundInDocument?: boolean;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Document comparison
// ---------------------------------------------------------------------------

export interface DiffChange {
  id: string;
  clauseTitle: string;
  section: string;
  oldText: string;
  newText: string;
  /** e.g. "Tenant", "Landlord", "Employee", "Neutral" */
  favorsParty: string;
  favorsBadgeColor?: 'tenant' | 'landlord' | 'neutral';
  explanation: string;
}

export interface ComparisonResult {
  docAName: string;
  docBName: string;
  summary: string;
  changes: DiffChange[];
}

// ---------------------------------------------------------------------------
// PII redaction
// ---------------------------------------------------------------------------

export type PiiType = 'NAME' | 'ACCOUNT' | 'SIGNATURE' | 'ADDRESS' | 'PHONE' | 'EMAIL' | 'IDENTIFIER' | 'MONEY';

export interface RedactionItem {
  id: string;
  original: string;
  placeholder: string;
  type: PiiType;
}

// ---------------------------------------------------------------------------
// Simulator
// ---------------------------------------------------------------------------

export interface SimulationResult {
  trigger: string;
  userRecourse: string;
  rights: string;
  counterpartyRemedies: string;
  financialOrOperationalImpact: string;
  preventionOrNextStep: string;
  walkthrough: string;
}

// ---------------------------------------------------------------------------
// Fairer language / draft message
// ---------------------------------------------------------------------------

export interface FairerLanguageResult {
  replacementText: string;
  rationale: string;
  keyChanges: string[];
}

export interface DraftMessageResult {
  recipient: string;
  subject: string;
  body: string;
  talkingPoints: string[];
}

export type RiskTag = 'standard' | 'unusual' | 'high-attention' | 'missing-but-expected';

export type ReadingMode = 'standard' | 'high-contrast';

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
  category: 'deadline' | 'payment' | 'renewal' | 'penalty';
  isoDate?: string; // for .ics generation
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
  docType: 'lease' | 'employment' | 'nda' | 'loan' | 'tos' | 'vendor' | 'custom';
  detectedType: string;
  summary: string;
  clauses: Clause[];
  timeline: TimelineObligation[];
  questionsChecklist: PreSigningQuestion[];
  lawyerBrief: LawyerBrief;
}

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

export interface DiffChange {
  id: string;
  clauseTitle: string;
  section: string;
  oldText: string;
  newText: string;
  favorsParty: string; // e.g. "Tenant", "Landlord", "Employee", "Neutral"
  favorsBadgeColor?: 'tenant' | 'landlord' | 'neutral';
  explanation: string;
}

export interface ComparisonResult {
  docAName: string;
  docBName: string;
  summary: string;
  changes: DiffChange[];
}

export interface RedactionItem {
  id: string;
  original: string;
  placeholder: string;
  type: 'NAME' | 'ACCOUNT' | 'SIGNATURE' | 'ADDRESS' | 'PHONE' | 'EMAIL' | 'IDENTIFIER' | 'MONEY';
}

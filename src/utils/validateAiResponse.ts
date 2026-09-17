/**
 * Runtime validation helpers for AI-generated JSON responses.
 *
 * Because AI output is untrusted external data, we validate every response
 * before it reaches application state.  Missing or malformed fields receive
 * safe fallbacks rather than crashing the UI.
 */

import type {
  SimulationResult,
  FairerLanguageResult,
  DraftMessageResult,
  Citation,
  RiskTag,
} from '../types';

// ---------------------------------------------------------------------------
// Primitive helpers
// ---------------------------------------------------------------------------

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function safeBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

// ---------------------------------------------------------------------------
// Domain validators
// ---------------------------------------------------------------------------

const VALID_RISK_TAGS = new Set<RiskTag>([
  'standard',
  'unusual',
  'high-attention',
  'missing-but-expected',
]);

export function validateRiskTag(value: unknown): RiskTag {
  if (typeof value === 'string' && VALID_RISK_TAGS.has(value as RiskTag)) {
    return value as RiskTag;
  }
  return 'standard';
}

/**
 * Validates and normalises a Q&A response object from the /api/qa endpoint.
 */
export function validateQAResponse(raw: unknown): {
  answer: string;
  foundInDocument: boolean;
  citations: Citation[];
} {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  const citations: Citation[] = Array.isArray(obj.citations)
    ? (obj.citations as Array<Record<string, unknown>>)
        .filter(
          (c) =>
            typeof c === 'object' &&
            c !== null &&
            typeof c.clauseId === 'string' &&
            typeof c.clauseNumber === 'string' &&
            typeof c.clauseTitle === 'string'
        )
        .map((c) => ({
          clauseId: String(c.clauseId),
          clauseNumber: String(c.clauseNumber),
          clauseTitle: String(c.clauseTitle),
          quote: typeof c.quote === 'string' ? c.quote : undefined,
        }))
    : [];

  return {
    answer: safeString(
      obj.answer,
      'The document does not contain information regarding this question.'
    ),
    foundInDocument: safeBool(obj.foundInDocument, false),
    citations,
  };
}

/**
 * Validates and normalises a simulation result from /api/simulate.
 */
export function validateSimulationResult(raw: unknown): SimulationResult {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const fallback = 'Not determinable from the clause text alone.';
  return {
    trigger: safeString(obj.trigger, fallback),
    userRecourse: safeString(obj.userRecourse, fallback),
    rights: safeString(obj.rights, fallback),
    counterpartyRemedies: safeString(obj.counterpartyRemedies, fallback),
    financialOrOperationalImpact: safeString(obj.financialOrOperationalImpact, fallback),
    preventionOrNextStep: safeString(obj.preventionOrNextStep, fallback),
    walkthrough: safeString(obj.walkthrough, fallback),
  };
}

/**
 * Validates and normalises a fairer-language result from /api/suggest-fairer-language.
 */
export function validateFairerLanguageResult(
  raw: unknown,
  originalTextFallback: string
): FairerLanguageResult {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    replacementText: safeString(obj.replacementText, originalTextFallback),
    rationale: safeString(
      obj.rationale,
      'Standard balanced contractual provision.'
    ),
    keyChanges: safeStringArray(obj.keyChanges),
  };
}

/**
 * Validates and normalises a draft message result from /api/draft-message.
 */
export function validateDraftMessageResult(
  raw: unknown,
  subjectFallback: string
): DraftMessageResult {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    recipient: safeString(obj.recipient, 'Counterparty'),
    subject: safeString(obj.subject, subjectFallback),
    body: safeString(obj.body, ''),
    talkingPoints: safeStringArray(obj.talkingPoints),
  };
}

import { RedactionItem, DocumentAnalysis, Clause, TimelineObligation, PreSigningQuestion, LawyerBrief } from '../types';

export function detectAndRedactPII(text: string): {
  redactedText: string;
  items: RedactionItem[];
} {
  const items: RedactionItem[] = [];
  let workingText = text;
  let counter = 1;

  // 1. Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  workingText = workingText.replace(emailRegex, (match) => {
    const placeholder = `[REDACTED_EMAIL_${counter++}]`;
    items.push({ id: `pii-${items.length + 1}`, original: match, placeholder, type: 'EMAIL' });
    return placeholder;
  });

  // 2. SSN / National Tax Identifiers (e.g. 123-45-6789)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  workingText = workingText.replace(ssnRegex, (match) => {
    const placeholder = `[REDACTED_SSN_${counter++}]`;
    items.push({ id: `pii-${items.length + 1}`, original: match, placeholder, type: 'IDENTIFIER' });
    return placeholder;
  });

  // 3. Phone numbers (US & international formats)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  workingText = workingText.replace(phoneRegex, (match) => {
    if (match.length >= 10) {
      const placeholder = `[REDACTED_PHONE_${counter++}]`;
      items.push({ id: `pii-${items.length + 1}`, original: match, placeholder, type: 'PHONE' });
      return placeholder;
    }
    return match;
  });

  // 4. Financial Account Numbers (Bank Accounts, Routing Numbers, IBANs, Credit Cards)
  // 4a. Credit Card Patterns (13-19 digits, with spaces or hyphens)
  const ccRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{4}[-\s]?\d{6}[-\s]?\d{5}\b/g;
  workingText = workingText.replace(ccRegex, (match) => {
    // Basic sanity check to avoid matching years or general 4-digit numbers
    const cleanDigits = match.replace(/[-\s]/g, '');
    if (cleanDigits.length >= 13 && cleanDigits.length <= 19) {
      const placeholder = `[REDACTED_ACCOUNT_${counter++}]`;
      items.push({ id: `pii-${items.length + 1}`, original: match, placeholder, type: 'ACCOUNT' });
      return placeholder;
    }
    return match;
  });

  // 4b. Bank Account / Routing / IBAN labels
  const bankAccountRegex = /\b(?:Account\s*(?:Number|No\.?|#)?|Acct\s*(?:No\.?|#)?|Routing\s*(?:Number|No\.?|#)?|IBAN|SWIFT|BIC|Bank\s*Account(?:\s*#)?)\s*[:=]?\s*([A-Z0-9-]{6,34})\b/gi;
  workingText = workingText.replace(bankAccountRegex, (fullMatch, numberMatch) => {
    const placeholder = `[REDACTED_ACCOUNT_${counter++}]`;
    items.push({ id: `pii-${items.length + 1}`, original: numberMatch, placeholder, type: 'ACCOUNT' });
    return fullMatch.replace(numberMatch, placeholder);
  });

  // 5. Signatures (Electronic, digital, or manual signature lines)
  // e.g. "By: /s/ John Doe", "/s/ Jane Smith", "Signature: [Mark]", "Signed by: Michael Scott"
  const sigRegex = /(?:By:\s*\/s\/|\/s\/|Signature:\s*|Signed by:\s*|Digitally signed by:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi;
  workingText = workingText.replace(sigRegex, (fullMatch, nameMatch) => {
    const placeholder = `[REDACTED_SIGNATURE_${counter++}]`;
    items.push({ id: `pii-${items.length + 1}`, original: nameMatch, placeholder, type: 'SIGNATURE' });
    return fullMatch.replace(nameMatch, placeholder);
  });

  // 6. Physical & Postal Addresses
  // Matches street number, name, street type, optional apt/suite, optional city/state/zip
  const addressRegex = /\b\d{1,5}\s+[A-Za-z0-9.\s]{3,35}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Lane|Ln|Drive|Dr|Court|Ct|Way|Plaza|Pkwy)(?:\s+(?:Apt|Unit|Suite|Ste|Floor|Fl)\s*[A-Za-z0-9-]+)?(?:\s*,?\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)?\b/gi;
  workingText = workingText.replace(addressRegex, (match) => {
    const placeholder = `[REDACTED_ADDRESS_${counter++}]`;
    items.push({ id: `pii-${items.length + 1}`, original: match, placeholder, type: 'ADDRESS' });
    return placeholder;
  });

  // 7. Named Parties & Individuals
  // 7a. Formal Party labels: "Tenant: John Doe", "Landlord: Robert Acme", "Vendor: TechCorp Solutions"
  const partyRegex = /(?:Tenant|Landlord|Employee|Employer|Borrower|Lender|Vendor|Client|Customer|Contractor|Principal|Consultant|Attn|Representative):\s*([A-Z][A-Za-z0-9&.,]+(?:\s+[A-Z][A-Za-z0-9&.,]+)+)/g;
  workingText = workingText.replace(partyRegex, (fullMatch, nameMatch) => {
    const placeholder = `[REDACTED_NAME_${counter++}]`;
    items.push({ id: `pii-${items.length + 1}`, original: nameMatch, placeholder, type: 'NAME' });
    return fullMatch.replace(nameMatch, placeholder);
  });

  // 7b. Name prefixes like "Name: John Doe" or "Full Legal Name: Jane Smith"
  const directNameRegex = /(?:Full Legal Name|Full Name|Name of (?:Individual|Employee|Tenant|Client)|Signatory Name):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi;
  workingText = workingText.replace(directNameRegex, (fullMatch, nameMatch) => {
    const placeholder = `[REDACTED_NAME_${counter++}]`;
    items.push({ id: `pii-${items.length + 1}`, original: nameMatch, placeholder, type: 'NAME' });
    return fullMatch.replace(nameMatch, placeholder);
  });

  return { redactedText: workingText, items };
}

/**
 * Restores masked PII tokens in a raw string back to original client values.
 */
export function restorePIIText(text: string, items: RedactionItem[]): string {
  if (!text || !items || items.length === 0) return text;
  let restored = text;
  for (const item of items) {
    restored = restored.split(item.placeholder).join(item.original);
  }
  return restored;
}

/**
 * Traverses a full DocumentAnalysis structure and restores all PII placeholders,
 * ensuring the user views their complete restored data while external AI services
 * never received unredacted identifiers.
 */
export function restoreDocumentAnalysisPII(
  doc: DocumentAnalysis,
  items: RedactionItem[]
): DocumentAnalysis {
  if (!items || items.length === 0) return doc;

  const restore = (str?: string) => (str ? restorePIIText(str, items) : str || '');

  const restoredClauses: Clause[] = doc.clauses.map((c) => ({
    ...c,
    title: restore(c.title),
    originalText: restore(c.originalText),
    simplifiedText: restore(c.simplifiedText),
    preciseText: restore(c.preciseText),
    tagReason: restore(c.tagReason),
    consequenceWalkthrough: c.consequenceWalkthrough ? restore(c.consequenceWalkthrough) : undefined,
    jargonTerms: c.jargonTerms.map((j) => ({
      term: restore(j.term),
      definition: restore(j.definition),
    })),
  }));

  const restoredTimeline: TimelineObligation[] = doc.timeline.map((t) => ({
    ...t,
    title: restore(t.title),
    description: restore(t.description),
    party: restore(t.party),
    dateOrTrigger: restore(t.dateOrTrigger),
  }));

  const restoredQuestions: PreSigningQuestion[] = doc.questionsChecklist.map((q) => ({
    ...q,
    question: restore(q.question),
    whyAsk: restore(q.whyAsk),
    clauseTitle: restore(q.clauseTitle),
  }));

  const restoredLawyerBrief: LawyerBrief = {
    summary: restore(doc.lawyerBrief?.summary || ''),
    disclaimer: restore(doc.lawyerBrief?.disclaimer || ''),
    openQuestions: (doc.lawyerBrief?.openQuestions || []).map((q) => restore(q)),
    missingProvisions: (doc.lawyerBrief?.missingProvisions || []).map((m) => restore(m)),
    flaggedClauses: (doc.lawyerBrief?.flaggedClauses || []).map((f) => ({
      ...f,
      clauseTitle: restore(f.clauseTitle),
      concern: restore(f.concern),
      paralegalNote: restore(f.paralegalNote),
    })),
  };

  return {
    ...doc,
    title: restore(doc.title),
    summary: restore(doc.summary),
    detectedType: restore(doc.detectedType),
    clauses: restoredClauses,
    timeline: restoredTimeline,
    questionsChecklist: restoredQuestions,
    lawyerBrief: restoredLawyerBrief,
  };
}

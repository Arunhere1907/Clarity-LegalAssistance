import { describe, it, expect } from 'vitest';
import {
  validateQAResponse,
  validateSimulationResult,
  validateFairerLanguageResult,
  validateDraftMessageResult,
  validateRiskTag,
} from '../utils/validateAiResponse';

// ---------------------------------------------------------------------------
// AI response validation tests
// These verify that malformed / adversarial AI output cannot crash the app.
// ---------------------------------------------------------------------------

describe('validateRiskTag', () => {
  it('accepts all valid risk tags', () => {
    expect(validateRiskTag('standard')).toBe('standard');
    expect(validateRiskTag('unusual')).toBe('unusual');
    expect(validateRiskTag('high-attention')).toBe('high-attention');
    expect(validateRiskTag('missing-but-expected')).toBe('missing-but-expected');
  });

  it('falls back to "standard" for unknown values', () => {
    expect(validateRiskTag('CRITICAL')).toBe('standard');
    expect(validateRiskTag(42)).toBe('standard');
    expect(validateRiskTag(null)).toBe('standard');
    expect(validateRiskTag(undefined)).toBe('standard');
    expect(validateRiskTag('')).toBe('standard');
  });
});

describe('validateQAResponse', () => {
  it('accepts a well-formed response', () => {
    const raw = {
      answer: 'Per [c1], rent is due on the 1st.',
      foundInDocument: true,
      citations: [
        { clauseId: 'c1', clauseNumber: 'Section 1', clauseTitle: 'Rent', quote: 'rent is due' },
      ],
    };
    const result = validateQAResponse(raw);
    expect(result.answer).toBe('Per [c1], rent is due on the 1st.');
    expect(result.foundInDocument).toBe(true);
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0].clauseId).toBe('c1');
  });

  it('falls back gracefully when answer is missing', () => {
    const result = validateQAResponse({});
    expect(result.answer).toContain('does not contain information');
    expect(result.foundInDocument).toBe(false);
    expect(result.citations).toHaveLength(0);
  });

  it('handles null input without throwing', () => {
    expect(() => validateQAResponse(null)).not.toThrow();
    const result = validateQAResponse(null);
    expect(result.citations).toEqual([]);
  });

  it('filters out malformed citation objects', () => {
    const raw = {
      answer: 'some answer',
      foundInDocument: true,
      citations: [
        { clauseId: 'c1', clauseNumber: 'S1', clauseTitle: 'Rent' }, // valid
        { clauseId: 'c2' },                                           // missing required fields
        null,                                                          // null entry
        'not an object',                                               // wrong type
      ],
    };
    const result = validateQAResponse(raw);
    expect(result.citations).toHaveLength(1);
  });

  it('handles XSS-looking answer text by preserving it as plain string (sanitisation is in renderer)', () => {
    const raw = {
      answer: '<script>alert(1)</script>',
      foundInDocument: false,
      citations: [],
    };
    const result = validateQAResponse(raw);
    // The validator should return the string — XSS escaping is the renderer's job
    expect(typeof result.answer).toBe('string');
  });
});

describe('validateSimulationResult', () => {
  it('accepts a complete result', () => {
    const raw = {
      trigger: 'Missed delivery date',
      userRecourse: 'Deduct $1000/day',
      rights: 'Right to terminate after 14 days',
      counterpartyRemedies: 'None if in breach',
      financialOrOperationalImpact: '$14,000 max',
      preventionOrNextStep: 'Document all deliveries',
      walkthrough: 'If vendor misses date...',
    };
    const result = validateSimulationResult(raw);
    expect(result.trigger).toBe('Missed delivery date');
    expect(result.walkthrough).toBe('If vendor misses date...');
  });

  it('provides fallback text for all missing fields', () => {
    const result = validateSimulationResult({});
    expect(result.trigger).toContain('Not determinable');
    expect(result.userRecourse).toContain('Not determinable');
    expect(result.walkthrough).toContain('Not determinable');
  });

  it('handles completely malformed input (null)', () => {
    expect(() => validateSimulationResult(null)).not.toThrow();
    const result = validateSimulationResult(null);
    expect(typeof result.trigger).toBe('string');
  });
});

describe('validateFairerLanguageResult', () => {
  it('accepts a valid result', () => {
    const raw = {
      replacementText: 'New balanced clause text.',
      rationale: 'Removes one-sided penalties.',
      keyChanges: ['Removed auto-renewal', 'Added 30-day notice'],
    };
    const result = validateFairerLanguageResult(raw, 'fallback original');
    expect(result.replacementText).toBe('New balanced clause text.');
    expect(result.keyChanges).toHaveLength(2);
  });

  it('falls back to original text when replacementText missing', () => {
    const result = validateFairerLanguageResult({}, 'THE ORIGINAL TEXT');
    expect(result.replacementText).toBe('THE ORIGINAL TEXT');
  });

  it('returns empty keyChanges array for non-array input', () => {
    const raw = { replacementText: 'x', rationale: 'y', keyChanges: 'not an array' };
    const result = validateFairerLanguageResult(raw, '');
    expect(result.keyChanges).toEqual([]);
  });
});

describe('validateDraftMessageResult', () => {
  it('accepts a valid draft', () => {
    const raw = {
      recipient: 'Landlord',
      subject: 'Re: Clause 3',
      body: 'Dear Landlord, please consider...',
      talkingPoints: ['Point 1', 'Point 2'],
    };
    const result = validateDraftMessageResult(raw, 'fallback subject');
    expect(result.recipient).toBe('Landlord');
    expect(result.talkingPoints).toHaveLength(2);
  });

  it('falls back to subject fallback when subject missing', () => {
    const result = validateDraftMessageResult({}, 'FALLBACK SUBJECT');
    expect(result.subject).toBe('FALLBACK SUBJECT');
    expect(result.recipient).toBe('Counterparty');
  });

  it('filters non-string values from talkingPoints', () => {
    const raw = {
      recipient: 'Vendor',
      subject: 'Re: Delivery',
      body: 'Text',
      talkingPoints: ['Valid point', 42, null, 'Another point'],
    };
    const result = validateDraftMessageResult(raw, '');
    expect(result.talkingPoints).toEqual(['Valid point', 'Another point']);
  });
});

// ---------------------------------------------------------------------------
// Security: Malicious input tests — these must NOT crash the application
// ---------------------------------------------------------------------------

describe('Security — malformed AI output', () => {
  const maliciousInputs = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '[click](javascript:alert(1))',
    '{"__proto__":{"polluted":true}}',
    '\x00\x01\x02',            // null bytes
    'A'.repeat(100_000),       // oversized string
    JSON.stringify(null),
    '',
  ];

  maliciousInputs.forEach((input) => {
    it(`validateQAResponse does not throw for: ${input.slice(0, 40)}`, () => {
      expect(() => validateQAResponse({ answer: input, foundInDocument: false, citations: [] })).not.toThrow();
    });

    it(`validateSimulationResult does not throw for: ${input.slice(0, 40)}`, () => {
      expect(() => validateSimulationResult({ trigger: input })).not.toThrow();
    });
  });

  it('rejects a completely non-object AI response', () => {
    expect(() => validateQAResponse('just a string')).not.toThrow();
    expect(() => validateQAResponse(12345)).not.toThrow();
    expect(() => validateQAResponse([])).not.toThrow();
  });
});

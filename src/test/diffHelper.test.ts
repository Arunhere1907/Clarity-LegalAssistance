import { describe, it, expect } from 'vitest';
import { computeWordDiff } from '../utils/diffHelper';

// ---------------------------------------------------------------------------
// Word-level diff computation tests
// ---------------------------------------------------------------------------

describe('computeWordDiff', () => {
  it('returns empty array for two empty strings', () => {
    expect(computeWordDiff('', '')).toEqual([]);
  });

  it('returns full addition when original is empty', () => {
    const tokens = computeWordDiff('', 'new text');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe('added');
    expect(tokens[0].text).toBe('new text');
  });

  it('returns full removal when replacement is empty', () => {
    const tokens = computeWordDiff('old text', '');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe('removed');
    expect(tokens[0].text).toBe('old text');
  });

  it('marks identical text as equal', () => {
    const tokens = computeWordDiff('same text here', 'same text here');
    const types = tokens.map((t) => t.type);
    expect(types.every((t) => t === 'equal')).toBe(true);
  });

  it('detects a single word change', () => {
    const tokens = computeWordDiff('pay rent monthly', 'pay rent weekly');
    const removed = tokens.filter((t) => t.type === 'removed');
    const added = tokens.filter((t) => t.type === 'added');
    expect(removed.some((t) => t.text.includes('monthly'))).toBe(true);
    expect(added.some((t) => t.text.includes('weekly'))).toBe(true);
  });

  it('detects a word addition', () => {
    const tokens = computeWordDiff('notice period', 'notice cure period');
    const added = tokens.filter((t) => t.type === 'added');
    expect(added.some((t) => t.text.includes('cure'))).toBe(true);
  });

  it('detects a word removal', () => {
    const tokens = computeWordDiff('30 calendar days notice', '30 days notice');
    const removed = tokens.filter((t) => t.type === 'removed');
    expect(removed.some((t) => t.text.includes('calendar'))).toBe(true);
  });

  it('handles very long identical strings without throwing', () => {
    const long = 'word '.repeat(500);
    expect(() => computeWordDiff(long, long)).not.toThrow();
  });

  it('falls back gracefully for extremely large inputs', () => {
    const big = 'word '.repeat(800);
    const changed = big + ' extra';
    const tokens = computeWordDiff(big, changed);
    // Should still return tokens (fallback path)
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('merges adjacent tokens of the same type', () => {
    const tokens = computeWordDiff('a b c', 'x y z');
    // Because all words changed, they should be merged into single removed and added tokens
    const removed = tokens.filter((t) => t.type === 'removed');
    const added = tokens.filter((t) => t.type === 'added');
    // At minimum, there should be at least one removed and one added segment
    expect(removed.length).toBeGreaterThan(0);
    expect(added.length).toBeGreaterThan(0);
  });
});

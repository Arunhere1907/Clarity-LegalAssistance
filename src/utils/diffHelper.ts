export interface DiffToken {
  type: 'equal' | 'removed' | 'added';
  text: string;
}

/**
 * Computes a word-level diff between original clause text and replacement clause text
 * for rendering visual legal redlines (struck-through deletions in red, additions in green).
 */
export function computeWordDiff(original: string, replacement: string): DiffToken[] {
  if (!original && !replacement) return [];
  if (!original) return [{ type: 'added', text: replacement }];
  if (!replacement) return [{ type: 'removed', text: original }];

  // Tokenize by words while preserving whitespace
  const tokenize = (str: string): string[] => {
    return str.match(/\S+|\s+/g) || [];
  };

  const wordsA = tokenize(original);
  const wordsB = tokenize(replacement);

  // Dynamic programming LCS table
  const n = wordsA.length;
  const m = wordsB.length;
  
  // Guard against extreme length to prevent browser freeze (fallback to chunked diff)
  if (n * m > 400000) {
    return [
      { type: 'removed', text: original },
      { type: 'added', text: replacement }
    ];
  }

  // Optimize table using 1D or standard 2D
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (wordsA[i - 1] === wordsB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff tokens
  let i = n;
  let j = m;
  const tokens: DiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      tokens.unshift({ type: 'equal', text: wordsA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ type: 'added', text: wordsB[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      tokens.unshift({ type: 'removed', text: wordsA[i - 1] });
      i--;
    }
  }

  // Merge adjacent tokens of the same type for cleaner DOM rendering
  const merged: DiffToken[] = [];
  for (const token of tokens) {
    if (merged.length > 0 && merged[merged.length - 1].type === token.type) {
      merged[merged.length - 1].text += token.text;
    } else {
      merged.push({ ...token });
    }
  }

  return merged;
}

/**
 * Per-clause response cache to avoid redundant API calls
 * Cache key: `${clauseId}:${mode}` where mode is 'simulate', 'draft', or 'fairer'
 * Scope: session-based (cleared on page refresh)
 */

export type CacheMode = 'simulate' | 'draft' | 'fairer';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ClauseResponseCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly TTL = 30 * 60 * 1000; // 30 minutes

  private getCacheKey(clauseId: string, mode: CacheMode, scenario?: string): string {
    // Include scenario hash for simulate mode to cache different scenarios separately
    if (mode === 'simulate' && scenario) {
      const scenarioHash = this.simpleHash(scenario);
      return `${clauseId}:${mode}:${scenarioHash}`;
    }
    return `${clauseId}:${mode}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  get<T>(clauseId: string, mode: CacheMode, scenario?: string): T | null {
    const key = this.getCacheKey(clauseId, mode, scenario);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(clauseId: string, mode: CacheMode, data: T, scenario?: string): void {
    const key = this.getCacheKey(clauseId, mode, scenario);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  clearForClause(clauseId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${clauseId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  getSize(): number {
    return this.cache.size;
  }

  getCacheStats(): { entries: number; oldestAge: number | null } {
    const now = Date.now();
    let oldestAge: number | null = null;

    for (const entry of this.cache.values()) {
      const age = now - entry.timestamp;
      if (oldestAge === null || age > oldestAge) {
        oldestAge = age;
      }
    }

    return {
      entries: this.cache.size,
      oldestAge,
    };
  }
}

// Singleton instance
export const clauseCache = new ClauseResponseCache();

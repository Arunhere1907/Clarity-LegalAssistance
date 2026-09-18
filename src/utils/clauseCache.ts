/**
 * Per-clause response cache to avoid redundant API calls
 * Cache key: `${clauseId}:${mode}` where mode is 'simulate', 'draft', or 'fairer'
 * Scope: session-based (cleared on page refresh)
 * Max size: 100 entries (LRU eviction)
 * Cleanup: Proactive expired entry removal every 5 minutes
 */

export type CacheMode = 'simulate' | 'draft' | 'fairer';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ClauseResponseCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_SIZE = 100; // LRU eviction threshold
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start proactive cleanup interval
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    this.cleanupTimer = setInterval(() => {
      this.removeExpiredEntries();
    }, this.CLEANUP_INTERVAL);
  }

  private removeExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private evictLRUIfNeeded(): void {
    if (this.cache.size >= this.MAX_SIZE) {
      // Find and remove oldest entry
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      
      for (const [key, entry] of this.cache.entries()) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  private getCacheKey(clauseId: string, mode: CacheMode, scenario?: string): string {
    // Include scenario hash for simulate mode to cache different scenarios separately
    if (mode === 'simulate' && scenario) {
      const scenarioHash = this.fnv1aHash(scenario);
      return `${clauseId}:${mode}:${scenarioHash}`;
    }
    return `${clauseId}:${mode}`;
  }

  /**
   * FNV-1a hash algorithm - fast, low collision, non-cryptographic
   */
  private fnv1aHash(str: string): string {
    const FNV_OFFSET_BASIS = 2166136261;
    const FNV_PRIME = 16777619;
    
    let hash = FNV_OFFSET_BASIS;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, FNV_PRIME);
    }
    
    // Convert to unsigned 32-bit and format as hex
    return (hash >>> 0).toString(36);
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
    // Evict LRU entry if cache is at capacity
    this.evictLRUIfNeeded();
    
    const key = this.getCacheKey(clauseId, mode, scenario);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
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

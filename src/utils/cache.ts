// In-memory cache for NFL data to reduce API calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + (ttlMinutes * 60 * 1000)
    };
    
    this.cache.set(key, entry);
    
    // Clean up expired entries periodically
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && Date.now() <= entry.expiresAt;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
  
  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.cache.size,
      active,
      expired
    };
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache key generators
export const CacheKeys = {
  NFL_DATA: 'nfl-data',
  STANDINGS: (configHash: string) => `standings-${configHash}`,
  ACHIEVEMENTS: (configHash: string, week: number) => `achievements-${configHash}-${week}`,
  NARRATIVES: (week: number) => `narratives-${week}`,
  TEAM_LOGOS: (team: string) => `logo-${team}`,
} as const;

// Helper function to generate cache key hash
export function generateConfigHash(config: any): string {
  return Buffer.from(JSON.stringify(config)).toString('base64').slice(0, 8);
}

// Cache wrapper for async functions
export async function withCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlMinutes: number = 60
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(cacheKey);
  if (cached !== null) {
    console.log(`Cache HIT: ${cacheKey}`);
    return cached;
  }
  
  console.log(`Cache MISS: ${cacheKey}`);
  
  // Fetch fresh data
  const data = await fetchFn();
  
  // Store in cache
  cache.set(cacheKey, data, ttlMinutes);
  
  return data;
}

// Pre-warming function for critical data
export async function prewarmCache() {
  console.log('Pre-warming cache with critical data...');
  
  try {
    // You can add critical data fetching here
    // For example, fetching current week NFL data
    console.log('Cache pre-warming completed');
  } catch (error) {
    console.error('Cache pre-warming failed:', error);
  }
}

// Cache statistics endpoint helper
export function getCacheStats() {
  return {
    ...cache.getStats(),
    keys: Array.from(cache['cache'].keys()).slice(0, 10), // First 10 keys for debugging
  };
}
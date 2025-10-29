interface CacheItem<T> {
  expires: number;
  data: T;
}

class CacheService {
  private prefix = 'animevolnitsa_cache_';
  private memoryCache = new Map<string, CacheItem<any>>();

  constructor() {
    this.hydrateMemoryCache();
  }

  private hydrateMemoryCache(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item: CacheItem<any> = JSON.parse(itemStr);
            if (item.expires === 0 || item.expires > Date.now()) {
              this.memoryCache.set(key, item);
            } else {
              localStorage.removeItem(key); // Clean up expired on hydration
            }
          }
        }
      }
      console.log(`[Cache] In-memory cache hydrated with ${this.memoryCache.size} items.`);
    } catch (e) {
      console.error("[Cache] Failed to hydrate memory cache from localStorage.", e);
    }
  }

  get<T>(key: string): T | null {
    const fullKey = this.prefix + key;
    
    // 1. Try memory cache first
    const memItem = this.memoryCache.get(fullKey);
    if (memItem) {
      if (memItem.expires === 0 || memItem.expires > Date.now()) {
        return memItem.data;
      } else {
        // Item expired, remove from both caches
        this.memoryCache.delete(fullKey);
        localStorage.removeItem(fullKey);
        return null;
      }
    }
    
    return null; // No need to check localStorage again, it's hydrated
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const fullKey = this.prefix + key;
    const expires = ttl ? Date.now() + ttl : 0; // 0 means it won't expire

    const item: CacheItem<T> = { expires, data };

    try {
      // Set in both caches
      this.memoryCache.set(fullKey, item);
      localStorage.setItem(fullKey, JSON.stringify(item));
    } catch (error) {
      console.error(`[Cache] Error setting item for key "${key}". LocalStorage might be full.`, error);
      this.cleanUpStorage();
    }
  }

  remove(key: string): void {
    const fullKey = this.prefix + key;
    this.memoryCache.delete(fullKey);
    localStorage.removeItem(fullKey);
  }

  clear(): void {
    const keysToRemove: string[] = [];
    this.memoryCache.forEach((_, key) => {
      if (key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach(key => {
      this.memoryCache.delete(key);
      localStorage.removeItem(key);
    });
  }

  clearExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;
    this.memoryCache.forEach((item, key) => {
      if (item.expires !== 0 && item.expires <= now) {
        this.memoryCache.delete(key);
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });
    if (cleanedCount > 0) {
      console.log(`[Cache] Cleared ${cleanedCount} expired items.`);
    }
  }

  private cleanUpStorage(): void {
    console.warn("[Cache] LocalStorage is likely full. Cleaning up the oldest 20% of expiring items.");
    
    const items: { key: string, expires: number }[] = [];
    this.memoryCache.forEach((item, key) => {
      if (key.startsWith(this.prefix) && item.expires > 0) { // only clean up expiring items
        items.push({ key, expires: item.expires });
      }
    });

    items.sort((a, b) => a.expires - b.expires);
    const itemsToRemoveCount = Math.ceil(items.length * 0.2);
    
    for (let i = 0; i < itemsToRemoveCount; i++) {
      if (items[i]) {
        this.remove(items[i].key.replace(this.prefix, ''));
      }
    }
  }
}

export const cache = new CacheService();

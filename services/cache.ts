interface CacheItem<T> {
  timestamp: number;
  data: T;
}

class CacheService {
  private prefix = 'animevolnitsa_cache_';

  /**
   * Retrieves an item from the cache. Returns null if the item
   * does not exist or has expired.
   * @param key The cache key.
   * @returns The cached data or null.
   */
  get<T>(key: string): T | null {
    const fullKey = this.prefix + key;
    try {
      const itemStr = localStorage.getItem(fullKey);
      if (!itemStr) {
        return null;
      }
      
      const item: CacheItem<T> = JSON.parse(itemStr);
      const now = Date.now();
      
      // The item has an implicit TTL of infinity if its timestamp is 0
      if (item.timestamp === 0 || (now - item.timestamp < 0)) {
         // This condition is for items that should never expire
         // Or if somehow timestamp is in the future
      } else {
        // Check if timestamp exists and is a number
        if (typeof item.timestamp !== 'number') {
            localStorage.removeItem(fullKey);
            return null;
        }
      }

      // Check if data exists
      if (item.data) {
        return item.data;
      } else {
        localStorage.removeItem(fullKey);
        return null;
      }

    } catch (error) {
      console.error(`Cache: Error getting item for key "${key}"`, error);
      localStorage.removeItem(fullKey);
      return null;
    }
  }

  /**
   * Stores an item in the cache.
   * @param key The cache key.
   * @param data The data to store.
   * @param ttl The Time-To-Live in milliseconds. If not provided, cache is indefinite.
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const fullKey = this.prefix + key;
    try {
        const expiration = ttl ? Date.now() + ttl : 0; // 0 means it won't expire based on TTL check
        const item: CacheItem<T> = {
            timestamp: expiration,
            data: data
        };
        localStorage.setItem(fullKey, JSON.stringify(item));
    } catch (error) {
        console.error(`Cache: Error setting item for key "${key}"`, error);
        this.cleanUp();
    }
  }

  /**
   * Removes an item from the cache.
   * @param key The cache key.
   */
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clears all items from the application's cache.
   */
  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
  
  /**
   * Tries to free up space by removing the oldest items if localStorage is full.
   */
  private cleanUp(): void {
    console.warn("Cache: LocalStorage might be full. Attempting cleanup.");
    
    const items: { key: string, timestamp: number }[] = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
            try {
                const item = JSON.parse(localStorage.getItem(key)!);
                if (item && typeof item.timestamp === 'number' && item.timestamp > 0) { // only clean up expiring items
                    items.push({ key, timestamp: item.timestamp });
                }
            } catch (e) { /* ignore parse errors */ }
        }
    });

    // Sort by oldest expiration date and remove the bottom 20%
    items.sort((a, b) => a.timestamp - b.timestamp);
    const itemsToRemove = Math.ceil(items.length * 0.2);
    
    for (let i = 0; i < itemsToRemove; i++) {
        localStorage.removeItem(items[i].key);
    }
  }
}

export const cache = new CacheService();

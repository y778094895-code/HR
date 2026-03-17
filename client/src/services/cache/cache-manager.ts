interface CacheItem<T> {
    data: T;
    expiry: number;
}

class CacheManager {
    private cache = new Map<string, CacheItem<any>>();
    private defaultTTL = 10 * 60 * 1000; // 10 minutes

    set<T>(key: string, data: T, ttl?: number): void {
        const expiry = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, { data, expiry });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    clearByPattern(pattern: string): void {
        const regex = new RegExp(pattern.replace('*', '.*'));
        Array.from(this.cache.keys()).forEach(key => {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        });
    }
}

export const cacheManager = new CacheManager();

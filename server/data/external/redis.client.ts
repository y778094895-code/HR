import Redis from 'ioredis';

let _client: Redis | null = null;

function getClient(): Redis {
    if (!_client) {
        _client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            lazyConnect: true,
            enableOfflineQueue: false,
            maxRetriesPerRequest: 1,
            connectTimeout: 2000,
        });
        _client.on('error', (err: Error) => {
            // Warn but don't crash — Redis is optional for caching
            console.warn(`[Redis] ${err.message}`);
        });
    }
    return _client;
}

/** Get a string value; returns null on miss or Redis unavailability. */
export async function redisGet(key: string): Promise<string | null> {
    try {
        return await getClient().get(key);
    } catch {
        return null;
    }
}

/** Set a string value with TTL (seconds). Silently ignores Redis errors. */
export async function redisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
        await getClient().set(key, value, 'EX', ttlSeconds);
    } catch {
        // Cache write failure is non-fatal
    }
}

/** Delete a key. Silently ignores Redis errors. */
export async function redisDel(key: string): Promise<void> {
    try {
        await getClient().del(key);
    } catch {
        // Cache eviction failure is non-fatal
    }
}

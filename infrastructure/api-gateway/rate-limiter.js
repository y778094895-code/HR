const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('redis');

class RateLimiter {
    constructor() {
        this.client = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.client.connect().catch(console.error);
    }

    createLimiter(serviceName, maxRequests = 100, windowMs = 60000) {
        return rateLimit({
            store: new RedisStore({
                sendCommand: (...args) => this.client.sendCommand(args),
                prefix: `rl:${serviceName}:`
            }),
            windowMs,
            max: maxRequests,
            message: {
                error: 'Rate limit exceeded',
                service: serviceName,
                retryAfter: windowMs / 1000
            },
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: (req) => {
                // Rate limit by User ID if authenticated, otherwise by IP
                return req.user?.id || req.ip;
            }
        });
    }
}

module.exports = new RateLimiter();

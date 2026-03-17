const jwt = require('jsonwebtoken');
const redis = require('redis');

class AuthMiddleware {
    constructor() {
        this.redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redisClient.connect().catch(console.error);
        this.jwtSecret = process.env.JWT_SECRET || 'super-secret-key'; // Fallback for dev only
    }

    // Middleware to authenticate requests
    async authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                // Allow unauthenticated access if needed (e.g. public endpoints), 
                // but for now we block if this middleware is used.
                // Specific routes can bypass this middleware.
                return res.status(401).json({ error: 'No token provided' });
            }

            const token = authHeader.replace('Bearer ', '');

            // Verify token
            const decoded = jwt.verify(token, this.jwtSecret);

            // Check blacklist
            const isBlacklisted = await this.redisClient.get(`blacklist:${token}`);
            if (isBlacklisted) {
                return res.status(401).json({ error: 'Token revoked' });
            }

            req.user = decoded;
            next();
        } catch (error) {
            console.error('Auth error:', error.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    // Middleware to authorize based on roles
    authorize(allowedRoles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            next();
        };
    }
}

module.exports = new AuthMiddleware();

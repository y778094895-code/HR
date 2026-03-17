const jwt = require('jsonwebtoken');
const redis = require('redis');
const config = require('../config');

class AuthMiddleware {
    constructor() {
        this.redisClient = redis.createClient({
            url: config.redisUrl
        });
        this.redisClient.connect().catch(console.error);
        this.authenticate = this.authenticate.bind(this);
    }

    async authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const token = authHeader.replace('Bearer ', '');
            // console.log('Token:', token);
            // console.log('Secret:', config.jwtSecret); // BE CAREFUL LOGGING SECRETS IN PROD
            const decoded = jwt.verify(token, config.jwtSecret);

            // Check blacklist
            const isBlacklisted = await this.redisClient.get(`blacklist:${token}`);
            if (isBlacklisted) {
                return res.status(401).json({ error: 'Token revoked' });
            }

            req.user = decoded;
            next();
        } catch (error) {
            console.error('Auth error full:', error);
            console.error('Auth error message:', error.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

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

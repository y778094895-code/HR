const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const { v4: uuidv4 } = require('uuid');

class App {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(helmet());
        this.app.use(cors(config.cors));

        // Global Rate Limiter
        this.app.use(rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 1000,
            message: 'Too many requests'
        }));

        // Request Logging
        this.app.use((req, res, next) => {
            const traceId = req.headers['x-trace-id'] || uuidv4();
            req.headers['x-trace-id'] = traceId;
            console.log(`[${new Date().toISOString()}] [${traceId}] ${req.method} ${req.url}`);
            next();
        });
    }

    setupRoutes() {
        // API Routes
        this.app.get('/health', (req, res) => res.json({ status: 'ok' })); // Docker Healthcheck
        this.app.get('/api/health', (req, res) => {
            res.json({ status: 'ok', service: 'api-gateway' });
        });

        // mount routes at /api instead of /api/v1 so that /api/auth works (and /api/employees etc)
        // routes.js handles /auth, /employees etc.
        this.app.use('/api', routes);

        // Static Assets (Frontend)
        // Serve from ../../../client/dist if running locally, or ./dist in Docker
        const staticPath = process.env.NODE_ENV === 'production'
            ? path.join(__dirname, '../dist')
            : path.join(__dirname, '../../../client/dist');

        console.log(`Serving static assets from: ${staticPath}`);
        this.app.use(express.static(staticPath));

        // SPA Fallback
        this.app.get('*', (req, res) => {
            if (req.path.startsWith('/api')) {
                return res.status(404).json({ error: 'Not Found' });
            }
            res.sendFile(path.join(staticPath, 'index.html'));
        });
    }

    start() {
        this.app.listen(config.port, () => {
            console.log(`API Gateway listening on port ${config.port}`);
            console.log(`Environment: ${config.env}`);
        });
    }
}

module.exports = new App();

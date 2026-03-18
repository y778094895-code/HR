import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { logger } from './shared/logger';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';

import { DIContainer } from './shared/di/container';
import { AuthMiddleware } from './api/middleware/auth.middleware';
import { CorrelationIdMiddleware } from './api/middleware/correlation-id.middleware';
import { AuditMiddleware } from './api/middleware/audit.middleware';
import { ErrorMiddleware } from './api/middleware/error.middleware';

// Side-effect imports — @controller decorators register routes before the server is built
import './api/index';

export function buildApp(): { app: express.Application; container: Container } {
    const container = DIContainer.getInstance().container;

    const server = new InversifyExpressServer(container, null, { rootPath: '/api' });

    server.setConfig((app) => {
        // Structured request logging — attaches req.log / res.log and emits one line per request
        app.use(pinoHttp({
            logger,
            // Attach x-correlation-id as a log field
            customProps: (req) => ({ correlationId: (req as any).correlationId }),
            // Skip health-check noise
            autoLogging: { ignore: (req) => req.url === '/health' },
        }));

        // Security headers
        app.use(helmet());

        // Rate limiting — 100 requests per minute per IP
        app.use(rateLimit({
            windowMs: 60_000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            message: { success: false, message: 'Too many requests, please try again later.' },
        }));

        // CORS
        app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
        }));

        // Body parsing (express 4.16+ built-in, limit 10 mb)
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true }));

        // Correlation ID — must come before auth so the ID is available everywhere
        const correlationIdMiddleware = container.get(CorrelationIdMiddleware);
        app.use(correlationIdMiddleware.handler.bind(correlationIdMiddleware));

        // Identity extraction from gateway headers (x-user-id, x-user-role)
        const authMiddleware = container.get(AuthMiddleware);
        app.use(authMiddleware.handler.bind(authMiddleware));

        // Audit mutations
        const auditMiddleware = container.get(AuditMiddleware);
        app.use(auditMiddleware.handler.bind(auditMiddleware));
    });

    server.setErrorConfig((app) => {
        app.use(ErrorMiddleware.handler);
    });

    const app = server.build();

    // Health endpoints — added after build so they bypass the /api rootPath

    // Liveness: can the process respond?
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'ok',
            service: 'smart-hr-backend',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });

    // Readiness: can the process serve traffic? (checks dependencies)
    app.get('/api/health', async (_req, res) => {
        const checks: Record<string, { status: string; latencyMs?: number }> = {};
        let allHealthy = true;

        // Check Postgres
        try {
            const start = Date.now();
            const db = container.get<any>('DatabaseConnection');
            if (db?.db) {
                await db.db.execute(require('drizzle-orm').sql`SELECT 1`);
            }
            checks.postgres = { status: 'up', latencyMs: Date.now() - start };
        } catch {
            checks.postgres = { status: 'down' };
            allHealthy = false;
        }

        // Check Redis
        try {
            const redis = container.get<any>('CacheService');
            if (redis?.client) {
                const start = Date.now();
                await redis.client.ping();
                checks.redis = { status: 'up', latencyMs: Date.now() - start };
            } else {
                checks.redis = { status: 'not_configured' };
            }
        } catch {
            checks.redis = { status: 'down' };
            // Redis down is degraded, not fatal
        }

        res.status(allHealthy ? 200 : 503).json({
            status: allHealthy ? 'ok' : 'degraded',
            service: 'smart-hr-backend',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks,
        });
    });

    return { app, container };
}

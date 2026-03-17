import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import * as http from 'http';
import { WebSocketServer } from 'ws';
import { buildApp } from './app';
import { OutboxService } from './shared/infrastructure/outbox.service';
import { NotificationService } from './services/business/notification.service';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '3000', 10);

async function bootstrap(): Promise<void> {
    const { app, container } = buildApp();

    const httpServer = http.createServer(app);

    // WebSocket server shares the same HTTP server (upgrade events)
    const wss = new WebSocketServer({ server: httpServer });
    wss.on('connection', (ws) => {
        ws.on('error', (err) => console.error('[WS] Client error:', err));
    });

    httpServer.listen(PORT, async () => {
        console.log(`Smart HR Server running on port ${PORT}`);

        // Service registry — non-fatal if Consul is unavailable
        try {
            const serviceName = process.env.SERVICE_NAME || 'employee-service';
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { serviceRegistry } = require('./shared/infrastructure/service-registry');
            await serviceRegistry.register(serviceName, PORT, ['v1', 'nodejs', 'backend']);
        } catch (err) {
            console.warn('[server] Service registry unavailable — continuing without registration:', (err as Error).message);
        }

        // Outbox processor — non-fatal if DB is unavailable at start
        try {
            const outboxService = container.get<OutboxService>('OutboxService');
            outboxService.startProcessor();
        } catch (err) {
            console.warn('[server] Outbox processor failed to start:', (err as Error).message);
        }

        // Notification service (RabbitMQ) — non-fatal if broker is unavailable
        try {
            const notificationService = container.get<NotificationService>('NotificationService');
            await notificationService.initialize();
        } catch (err) {
            console.warn('[server] Notification service unavailable — continuing without event subscriptions:', (err as Error).message);
        }

        const shutdown = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { serviceRegistry } = require('./shared/infrastructure/service-registry');
                await serviceRegistry.deregister();
            } catch { /* ignore */ }
            httpServer.close(() => process.exit(0));
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    });
}

bootstrap().catch((err) => {
    console.error('Fatal: failed to start Smart HR Server', err);
    process.exit(1);
});

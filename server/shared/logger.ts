/**
 * Shared pino logger instance.
 * - Redacts sensitive fields: api_key, api_secret, password, token, authorization header.
 * - In development pretty-prints; in production outputs JSON.
 * - Import this instead of console.log throughout the server.
 */
import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
    level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
    ...(isDev && {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
    }),
    redact: {
        paths: [
            'api_key',
            'api_secret',
            'password',
            'passwordHash',
            'token',
            'req.headers.authorization',
            'req.headers.cookie',
        ],
        censor: '[REDACTED]',
    },
    base: {
        service: 'smart-hr-backend',
        env: process.env.NODE_ENV ?? 'development',
    },
});

export type Logger = typeof logger;

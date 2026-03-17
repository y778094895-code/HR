const { createProxyMiddleware } = require('http-proxy-middleware');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { getBreaker } = require('../utils/circuit-breaker');

const createServiceProxy = (serviceConfig, options = {}) => {
    const proxy = createProxyMiddleware({
        target: serviceConfig.url,
        changeOrigin: true,
        pathRewrite: options.pathRewrite,
        onProxyReq: (proxyReq, req, res) => {
            // Distributed Tracing
            const traceId = req.headers['x-trace-id'] || uuidv4();
            const spanId = uuidv4();

            req.headers['x-trace-id'] = traceId;
            proxyReq.setHeader('x-trace-id', traceId);
            proxyReq.setHeader('x-span-id', spanId);

            // User Context
            if (req.user) {
                proxyReq.setHeader('x-user-id', req.user.sub || req.user.id);
                proxyReq.setHeader('x-user-role', req.user.role);
            }
        },
        onError: (err, req, res) => {
            console.error(`Proxy error for ${serviceConfig.name}:`, err);
            // We can't easily trip the breaker from here unless we share state, 
            // but the wrapper below handles the "OPEN" state check.
            if (!res.headersSent) {
                res.status(503).json({
                    error: 'Service Unavailable',
                    service: serviceConfig.name,
                    traceId: req.headers['x-trace-id']
                });
            }
        }
    });

    return (req, res, next) => {
        // console.log(`[Proxy Debug] OriginalUrl: ${req.originalUrl}, Url: ${req.url}, BaseUrl: ${req.baseUrl}`);
        // console.log(`[Proxy Debug] Rewrite:`, options.pathRewrite);

        const breaker = getBreaker(serviceConfig.name);

        if (breaker.opened) {
            return res.status(503).json({ error: 'Circuit Breaker Open', service: serviceConfig.name });
        }

        // Fire the breaker
        // Opossum expects a function that returns a promise.
        // We wrap the proxy call in a promise to track success/failure for the breaker stats.
        breaker.fire(new Promise((resolve, reject) => {
            // Hook into response to resolve/reject
            const originalEnd = res.end;
            res.end = function (...args) {
                if (res.statusCode >= 500) {
                    reject(new Error(`Service returned ${res.statusCode}`));
                } else {
                    resolve();
                }
                originalEnd.apply(res, args);
            };

            // Call the actual proxy
            proxy(req, res, next);
        }))
            .catch((err) => {
                // Breaker caught an error (either from reject above or timeout)
                console.error(`Circuit Breaker Failure for ${serviceConfig.name}:`, err.message);
                // Note: Response might have already been sent by proxy.
                // If it was a timeout from Opossum, we need to send 503 if not sent.
                if (!res.headersSent) {
                    res.status(504).json({ error: 'Gateway Timeout', service: serviceConfig.name });
                }
            });
    };
};

module.exports = { createServiceProxy };

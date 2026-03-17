const express = require('express');
const auth = require('./middleware/auth');
const { createServiceProxy } = require('./middleware/proxy');
const config = require('./config');

const router = express.Router();

const createRewrite = (prefix) => (path, req) => {
    if (path === '/' || path === '') return prefix;
    if (path.startsWith(prefix)) return path;
    if (path.startsWith('/api/')) return path;
    return `${prefix}${path}`;
};

// Version endpoint
router.get('/version', (req, res) => res.json({ version: '1.0.0', service: 'api-gateway' }));

// Health Check (Gateway)
router.get('/health', (req, res) => res.json({ status: 'OK', timestamp: Date.now() }));

// ----------------------------------------------------------------------
// Public Routes (No auth required)
// ----------------------------------------------------------------------

// Auth Routes (Public)
router.use('/auth/login', createServiceProxy(config.services.employee, {
    pathRewrite: createRewrite('/api/auth/login')
}));

router.use('/auth/register', createServiceProxy(config.services.employee, {
    pathRewrite: createRewrite('/api/auth/register')
}));

// Public Health Checks (EXPLICITLY BEFORE AUTH MIDDLEWARE)
router.get('/employees/health', async (req, res) => {
    try {
        const upstream = await fetch(`${config.services.employee.url}/api/health`, { signal: AbortSignal.timeout(5000) });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    } catch (err) {
        res.status(503).json({ error: 'Service Unavailable', service: 'employee-service' });
    }
});

router.get('/ml/health', async (req, res) => {
    try {
        const upstream = await fetch(`${config.services.ml.url}/health`, { signal: AbortSignal.timeout(5000) });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    } catch (err) {
        res.status(503).json({ error: 'Service Unavailable', service: 'ml-service' });
    }
});

router.get('/hr/health', async (req, res) => {
    try {
        const upstream = await fetch(`${config.services.hrAi.url}/health`, { signal: AbortSignal.timeout(5000) });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    } catch (err) {
        res.status(503).json({ error: 'Service Unavailable', service: 'hr-ai-layer' });
    }
});

// ----------------------------------------------------------------------
// Protected Routes (Everything below this requires authentication)
// ----------------------------------------------------------------------

// Auth Routes (Protected - me, logout, refresh-token)
router.use('/auth',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/auth')
    })
);

// Dashboard
router.use('/dashboard',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/dashboard')
    })
);

// Employees
router.use('/employees',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/employees')
    })
);

// Fairness — routed through employee-service (controller is @controller('/fairness'))
router.use('/fairness',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/fairness')
    })
);

// Interventions
router.use('/interventions',
    auth.authenticate,
    createServiceProxy(config.services.intervention, {
        pathRewrite: createRewrite('/api/interventions')
    })
);

// Turnover / Attrition
router.use('/turnover',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/turnover')
    })
);

// Performance
router.use('/performance',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/performance')
    })
);

// Training
router.use('/training',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/training')
    })
);

// Reports
router.use('/reports',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/reports')
    })
);

// Alerts Center
router.use('/alerts',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/alerts')
    })
);

// Settings — rewrites to /api/console/v1/settings/*
router.use('/settings',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: (path, req) => path.replace(/^\/api\/settings/, '/api/console/v1/settings')
    })
);

// Notifications — rewrites to /api/console/v1/settings/notifications
router.use('/notifications',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: (path, req) => path.replace(/^\/api\/notifications/, '/api/console/v1/settings/notifications')
    })
);

// Security — rewrites to /api/console/v1/settings/security/*
router.use('/security',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: (path, req) => path.replace(/^\/api\/security/, '/api/console/v1/settings/security')
    })
);

// Sessions — rewrites to /api/console/v1/settings/security/sessions/*
router.use('/sessions',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: (path, req) => path.replace(/^\/api\/sessions/, '/api/console/v1/settings/security/sessions')
    })
);

// Appearance — rewrites to /api/console/v1/settings/appearance/*
router.use('/appearance',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: (path, req) => path.replace(/^\/api\/appearance/, '/api/console/v1/settings/appearance')
    })
);

// Integrations — rewrites to /api/console/v1/settings/integrations/*
router.use('/integrations',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: (path, req) => path.replace(/^\/api\/integrations/, '/api/console/v1/settings/integrations')
    })
);

// Data Quality — rewrites to /api/console/v1/data-quality/*
router.use('/quality',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: (path, req) => path.replace(/^\/api\/quality/, '/api/console/v1/data-quality')
    })
);

// Help & Support Tickets
router.use('/help',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: (path, req) => {
            let newPath = path.replace(/^\/api\/help/, '/api/console/v1/help');
            if (newPath.match(/^\/api\/console\/v1\/help\/support\/tickets/)) {
                newPath = newPath.replace(/\/support\/tickets/, '/tickets');
            }
            return newPath;
        }
    })
);

// Support (alias to help tickets)
router.use('/support',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: (path, req) => {
            if (path === '/api/support/categories' || path === '/api/support/categories/') {
                return '/api/console/v1/help/support-categories';
            }
            if (path === '/api/support/priorities' || path === '/api/support/priorities/') {
                return '/api/console/v1/help/support-priorities';
            }
            if (path.startsWith('/api/support/tickets')) {
                return path.replace(/^\/api\/support\/tickets/, '/api/console/v1/help/tickets');
            }
            return path.replace(/^\/api\/support/, '/api/console/v1/help');
        }
    })
);

// Users / RBAC
router.use('/users',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/users')
    })
);

// Impact analytics
router.use('/impact',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/impact')
    })
);

// Recommendations
router.use('/recommendations',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/recommendations')
    })
);

// ML Service (Protected) — routed through employee-service BFF
router.use('/ml',
    auth.authenticate,
    createServiceProxy(config.services.employee, {
        pathRewrite: createRewrite('/api/ml')
    })
);

module.exports = router;

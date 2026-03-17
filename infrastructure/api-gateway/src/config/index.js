const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../../.env') });

module.exports = {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'top-secret',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    services: {
        employee: {
            url: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3000',
            name: 'employee-service'
        },
        fairness: {
            url: process.env.FAIRNESS_SERVICE_URL || 'http://localhost:3002',
            name: 'fairness-service'
        },
        intervention: {
            url: process.env.INTERVENTION_SERVICE_URL || 'http://localhost:3003',
            name: 'intervention-service'
        },
        ml: {
            url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
            name: 'ml-service'
        },
        hrAi: {
            url: process.env.HR_AI_LAYER_URL || 'http://localhost:8001',
            name: 'hr-ai-layer'
        }
    },
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
        credentials: true
    }
};

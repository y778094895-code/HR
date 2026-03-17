const CircuitBreaker = require('opossum');
const axios = require('axios');
const serviceRegistry = require('../../infrastructure/service-discovery/registry');

class ServiceCircuitBreaker {
    constructor() {
        this.breakers = new Map();
    }

    getBreaker(serviceName, actionKey) {
        const key = `${serviceName}:${actionKey}`;

        if (!this.breakers.has(key)) {
            const options = {
                timeout: 5000, // If function takes longer than 5 seconds, trigger a failure
                errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
                resetTimeout: 30000 // After 30 seconds, try again.
            };

            const breaker = new CircuitBreaker(this.callService, options);

            breaker.fallback(this.fallback);

            breaker.on('open', () => console.warn(`Circuit opened for ${key}`));
            breaker.on('halfOpen', () => console.info(`Circuit half-open for ${key}`));
            breaker.on('close', () => console.info(`Circuit closed for ${key}`));

            this.breakers.set(key, breaker);
        }

        return this.breakers.get(key);
    }

    // The function wrapped by the circuit breaker
    async callService(params) {
        const { serviceName, method, url, data, headers } = params;

        // Resolve service URL from registry
        const serviceUrl = await serviceRegistry.discover(serviceName);

        // Make the request
        const response = await axios({
            method,
            url: `${serviceUrl}${url}`,
            data,
            headers
        });

        return response.data;
    }

    async fallback(params) {
        // Fallback response when circuit is open or request fails
        console.error(`Fallback triggered for ${params.serviceName}`);
        return {
            error: 'Service temporarily unavailable',
            service: params.serviceName,
            timestamp: Date.now(),
            fallback: true
        };
    }
}

module.exports = new ServiceCircuitBreaker();

const CircuitBreaker = require('opossum');

const options = {
    timeout: 5000, // Timeout after 5 seconds (Gateway Timeout)
    errorThresholdPercentage: 50, // Trip if 50% fail
    resetTimeout: 30000, // Wait 30s before trying again
    capacity: 100 // Bulkhead: Max 100 concurrent requests per service
};

const breakers = {};

const getBreaker = (serviceName) => { // Removed requestFunction param as we fire manually
    if (!breakers[serviceName]) {
        breakers[serviceName] = new CircuitBreaker(async (promise) => promise, { // Pass through promise
            ...options,
            name: serviceName
        });

        breakers[serviceName].fallback(() => {
            return { error: 'Service Unavailable', fallback: true };
        });

        breakers[serviceName].on('open', () => console.warn(`OPEN: Circuit breaker for ${serviceName}`));
        breakers[serviceName].on('halfOpen', () => console.warn(`HALF_OPEN: Circuit breaker for ${serviceName}`));
        breakers[serviceName].on('close', () => console.log(`CLOSE: Circuit breaker for ${serviceName}`));
    }
    return breakers[serviceName];
};

module.exports = { getBreaker };

const Consul = require('consul');

class ServiceRegistry {
    constructor() {
        this.consul = new Consul({
            host: process.env.CONSUL_HOST || 'consul',
            port: process.env.CONSUL_PORT || 8500,
            promisify: true
        });
    }

    async register(serviceName, serviceId, port, tags = []) {
        try {
            await this.consul.agent.service.register({
                name: serviceName,
                id: serviceId,
                address: process.env.SERVICE_ADDRESS || require('os').hostname(),
                port: parseInt(port),
                tags,
                check: {
                    http: `http://${process.env.SERVICE_ADDRESS || require('os').hostname()}:${port}/health`,
                    interval: '10s',
                    timeout: '5s',
                    deregistercriticalserviceafter: '30s'
                }
            });
            console.log(`Service ${serviceName} registered with id ${serviceId}`);
        } catch (error) {
            console.error('Service registration failed:', error);
        }
    }

    async deregister(serviceId) {
        try {
            await this.consul.agent.service.deregister(serviceId);
            console.log(`Service ${serviceId} deregistered`);
        } catch (error) {
            console.error('Service deregistration failed:', error);
        }
    }

    async discover(serviceName) {
        try {
            const result = await this.consul.catalog.service.nodes(serviceName);
            // consul.catalog.service.nodes returns [result, meta] or just result depending on config/version
            // We assume it returns an array of nodes.
            const services = result[0] || result;

            if (!Array.isArray(services) || services.length === 0) {
                throw new Error(`No instances of ${serviceName} found`);
            }

            // Simple Round-robin or Random
            const index = Math.floor(Math.random() * services.length);
            const service = services[index];

            // Construct URL
            // Use ServiceAddress if available, otherwise fallback (though ServiceAddress should be there)
            const address = service.ServiceAddress || service.Address;
            const port = service.ServicePort;

            return `http://${address}:${port}`;
        } catch (error) {
            console.error(`Service discovery failed for ${serviceName}:`, error.message);
            throw error;
        }
    }
}

module.exports = new ServiceRegistry();

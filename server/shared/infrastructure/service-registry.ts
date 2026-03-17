import Consul = require('consul');

export class ServiceRegistry {
    private consul: any;
    private serviceId: string;

    constructor() {
        this.consul = new Consul({
            host: process.env.CONSUL_HOST || 'consul',
            port: process.env.CONSUL_PORT || '8500',
            promisify: true
        });
    }

    async register(serviceName: string, port: number, tags: string[] = []): Promise<void> {
        this.serviceId = `${serviceName}-${require('os').hostname()}-${port}`;

        try {
            await this.consul.agent.service.register({
                name: serviceName,
                id: this.serviceId,
                address: process.env.SERVICE_ADDRESS || require('os').hostname(),
                port: port,
                tags,
                check: {
                    http: `http://${process.env.SERVICE_ADDRESS || require('os').hostname()}:${port}/health`,
                    interval: '10s',
                    timeout: '5s',
                    deregistercriticalserviceafter: '30s'
                }
            });
            console.log(`Service ${serviceName} registered with id ${this.serviceId}`);
        } catch (error) {
            console.error('Service registration failed:', error);
        }
    }

    async deregister(): Promise<void> {
        if (!this.serviceId) return;
        try {
            await this.consul.agent.service.deregister(this.serviceId);
            console.log(`Service ${this.serviceId} deregistered`);
        } catch (error) {
            console.error('Service deregistration failed:', error);
        }
    }
}

export const serviceRegistry = new ServiceRegistry();

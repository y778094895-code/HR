export interface IModule {
    name: string;
    dependencies: string[];
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getExports(): Record<string, any>;
}

export class ModuleManager {
    private modules: Map<string, IModule> = new Map();
    private initialized: Set<string> = new Set();

    async registerModule(module: IModule): Promise<void> {
        if (this.modules.has(module.name)) {
            throw new Error(`Module ${module.name} already registered`);
        }

        // Check circular dependencies logic would go here

        this.modules.set(module.name, module);
    }

    async initializeAll(): Promise<void> {
        // Topological sort logic would go here

        for (const [name, module] of this.modules) {
            if (!this.initialized.has(name)) {
                await module.initialize();
                this.initialized.add(name);
                console.log(`Module ${name} initialized`);
            }
        }
    }

    async getService<T>(moduleName: string, serviceName: string): Promise<T> {
        const module = this.modules.get(moduleName);
        if (!module) throw new Error(`Module ${moduleName} not found`);
        if (!this.initialized.has(moduleName)) throw new Error(`Module ${moduleName} not initialized`);

        return module.getExports()[serviceName];
    }
}

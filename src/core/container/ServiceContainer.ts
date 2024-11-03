export class ServiceContainer {
    private static instance: ServiceContainer;
    private services: Map<string, any> = new Map();

    private constructor() {}

    static getInstance(): ServiceContainer {
        if (!this.instance) {
            this.instance = new ServiceContainer();
        }
        return this.instance;
    }

    register<T>(key: string, service: T): void {
        this.services.set(key, service);
    }

    resolve<T>(key: string): T {
        const service = this.services.get(key);
        if (!service) {
            throw new Error(`Service ${key} not found`);
        }
        return service as T;
    }
}

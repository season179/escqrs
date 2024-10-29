import type { Saga, SagaMiddleware } from "../types";

export class LoggingMiddleware implements SagaMiddleware {
    async execute(saga: Saga, next: () => Promise<void>): Promise<void> {
        const startTime = Date.now();
        try {
            await next();
            const duration = Date.now() - startTime;
            console.log(
                `Saga ${saga.id} executed successfully in ${duration}ms`
            );
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(
                `Saga ${saga.id} execution failed after ${duration}ms`,
                error
            );
            throw error;
        }
    }
}

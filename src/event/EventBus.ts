import type { Event, EventHandler, EventMiddleware } from "./types";
import { EventHandlerNotFoundError } from "./types";

export class EventBus {
    private handlers = new Map<string, EventHandler[]>();
    private middlewares: EventMiddleware[] = [];

    /**
     * Register an event handler for a specific event type
     */
    register<T extends Event>(
        eventType: string,
        handler: EventHandler<T>
    ): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler);
    }

    /**
     * Add middleware to the event processing pipeline
     */
    use(middleware: EventMiddleware): void {
        this.middlewares.push(middleware);
    }

    /**
     * Publish an event to all registered handlers
     */
    async publish(event: Event): Promise<void> {
        const handlers = this.handlers.get(event.type);
        if (!handlers || handlers.length === 0) {
            throw new EventHandlerNotFoundError(event.type);
        }

        for (const handler of handlers) {
            const chain = this.createMiddlewareChain(event, handler);
            await chain();
        }
    }

    private createMiddlewareChain(
        event: Event,
        handler: EventHandler
    ): () => Promise<void> {
        let index = 0;

        const chain = async (): Promise<void> => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                await middleware.execute(event, chain);
            } else {
                await handler.handle(event);
            }
        };

        return chain;
    }
}

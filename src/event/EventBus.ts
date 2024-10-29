import type { Event, EventHandler, EventMiddleware } from "./types";
import { EventHandlerNotFoundError } from "./types";
import { SubscriptionManager } from "../subscription/SubscriptionManager";

export class EventBus {
    private handlers = new Map<string, EventHandler[]>();
    private middlewares: EventMiddleware[] = [];
    private subscriptionManager?: SubscriptionManager;

    /**
     * Create a new EventBus instance.
     * @param subscriptionManager Optional SubscriptionManager for publishing events to subscribers.
     */
    constructor(subscriptionManager?: SubscriptionManager) {
        this.subscriptionManager = subscriptionManager;
    }

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
        const handlers = this.handlers.get(event.type) || [];

        // Publish the event to subscribers via SubscriptionManager
        if (this.subscriptionManager) {
            this.subscriptionManager.publish(event.type, event);
        }

        // It's acceptable if there are no event handlers; events can still be published
        if (handlers.length === 0) {
            return;
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

// src/core/event/EventBus.ts
import type { Event } from "./Event";
import type { EventHandler } from "./EventHandler";
import type { AzureServiceBusMessageBroker } from "../../infrastructure/AzureServiceBusMessageBroker";

export class EventBus {
    private handlers = new Map<string, EventHandler[]>();
    private readonly EVENT_CHANNEL = "escqrs-events";

    constructor(private messageBroker: AzureServiceBusMessageBroker) {
        this.setupEventSubscription();
    }

    private async setupEventSubscription(): Promise<void> {
        await this.messageBroker.subscribe(
            this.EVENT_CHANNEL,
            async (message: unknown) => {
                const event = message as Event;
                const handlers = this.handlers.get(event.type) || [];
                await Promise.all(
                    handlers.map((handler) => handler.handle(event))
                );
            }
        );
    }

    subscribe(eventType: string, handler: EventHandler): void {
        const handlers = this.handlers.get(eventType) || [];
        handlers.push(handler);
        this.handlers.set(eventType, handlers);
    }

    async publish(event: Event): Promise<void> {
        await this.messageBroker.publish(this.EVENT_CHANNEL, event);
    }
}

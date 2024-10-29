export interface EventData {
    id: string;
    aggregateId: string;
    aggregateType: string;
    type: string;
    version: number;
    payload: any;
    metadata: Record<string, any>;
    timestamp: Date;
}

export interface EventStoreOptions {
    snapshotFrequency?: number;
}

export interface EventStreamOptions {
    fromVersion?: number;
    toVersion?: number;
}

export interface Event {
    id: string;
    aggregateId: string;
    aggregateType: string;
    type: string;
    version: number;
    payload: any;
    metadata: Record<string, any>;
    timestamp: Date;
}

export interface EventHandler<T extends Event = Event> {
    handle(event: T): Promise<void> | void;
}

export interface EventMiddleware {
    execute(event: Event, next: () => Promise<void>): Promise<void> | void;
}

export interface Subscription {
    eventType: string;
    handler: EventHandler;
}

export class EventHandlerNotFoundError extends Error {
    constructor(eventType: string) {
        super(`No handler registered for event type: ${eventType}`);
        this.name = "EventHandlerNotFoundError";
    }
}

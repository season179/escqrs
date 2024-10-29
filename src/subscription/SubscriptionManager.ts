import { EventEmitter } from "events";

export class SubscriptionManager {
    private eventEmitter = new EventEmitter();

    /**
     * Subscribe to an event
     */
    subscribe(eventType: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.on(eventType, listener);
    }

    /**
     * Unsubscribe from an event
     */
    unsubscribe(eventType: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.off(eventType, listener);
    }

    /**
     * Publish an event to all subscribers
     */
    publish(eventType: string, data: any): void {
        this.eventEmitter.emit(eventType, data);
    }
}

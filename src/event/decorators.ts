import { eventHandlers } from "./metadata";
import type { EventHandler } from "./types";

/**
 * Decorator to mark a class as an EventHandler.
 * @param eventType - The type of event this handler processes.
 */
export function EventHandler(eventType: string) {
    return function (constructor: new (...args: any[]) => EventHandler) {
        // Register the handler in the metadata storage
        if (!eventHandlers.has(eventType)) {
            eventHandlers.set(eventType, []);
        }
        eventHandlers.get(eventType)!.push(constructor);
    };
}

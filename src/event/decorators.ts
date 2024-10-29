import type { Event, EventHandler } from "./types";

export const eventHandlers = new Map<string, EventHandler[]>();

export function EventHandler(eventType: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        const handler: EventHandler = {
            handle: async (event: Event) => {
                await originalMethod.call(target, event);
            },
        };

        if (!eventHandlers.has(eventType)) {
            eventHandlers.set(eventType, []);
        }
        eventHandlers.get(eventType)!.push(handler);
    };
}

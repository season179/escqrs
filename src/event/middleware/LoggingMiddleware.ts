import type { Event, EventMiddleware } from "../types";

export class LoggingMiddleware implements EventMiddleware {
    async execute(event: Event, next: () => Promise<void>): Promise<void> {
        const startTime = Date.now();

        try {
            await next();

            const duration = Date.now() - startTime;
            console.log("Event handled successfully", {
                eventId: event.id,
                eventType: event.type,
                duration,
            });
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error("Event handling failed", {
                eventId: event.id,
                eventType: event.type,
                duration,
                error,
            });
            throw error;
        }
    }
}

import type { Event } from "../../domain/interfaces/event";

export interface EventStore {
    saveEvents(events: Event[]): Promise<void>;
    getEventById(aggregateId: string): Promise<Event[]>;
    close(): void;
}

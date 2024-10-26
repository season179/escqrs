import { nanoid } from 'nanoid';
import type { Event } from '../interfaces/event';

export abstract class AggregateRoot {
    protected id: string;
    protected version: number = 0;
    private uncommittedEvents: Event[] = [];

    constructor(id: string) {
        this.id = id;
    }

    getUncommittedEvents(): Event[] {
        return this.uncommittedEvents;
    }

    protected addEvent(type: string, payload: any): void {
        const event: Event = {
            id: `evt-${nanoid()}`,
            timestamp: new Date(),
            type,
            payload,
            aggregateId: this.id,
            version: ++this.version
        };
        this.uncommittedEvents.push(event);
    }
}

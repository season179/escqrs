import type { Event } from "../event/types";

export abstract class AggregateRoot {
    private _uncommittedEvents: Event[] = [];
    private _version = 0;

    get version(): number {
        return this._version;
    }

    /**
     * Apply an event to the aggregate
     */
    protected apply(event: Event, isNew: boolean = true): void {
        const handlerName = `on${event.type}`;
        if (typeof (this as any)[handlerName] === "function") {
            (this as any)[handlerName](event);
        }

        this._version = event.version;

        if (isNew) {
            this._uncommittedEvents.push(event);
        }
    }

    /**
     * Load events to rebuild the aggregate state
     */
    loadFromHistory(events: Event[]): void {
        for (const event of events) {
            this.apply(event, false);
        }
    }

    /**
     * Get uncommitted events to persist and publish
     */
    getUncommittedEvents(): Event[] {
        return this._uncommittedEvents;
    }

    /**
     * Clear uncommitted events after they are persisted
     */
    clearUncommittedEvents(): void {
        this._uncommittedEvents = [];
    }
}

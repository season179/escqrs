import type { Event } from "../event/types";
import type { Snapshot } from "../snapshot/types";

export abstract class AggregateRoot {
    protected _id: string;
    private _uncommittedEvents: Event[] = [];
    private _version = 0;

    constructor(id: string) {
        this._id = id;
    }

    get version(): number {
        return this._version;
    }

    get id(): string {
        return this._id;
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
    loadFromHistory(events: Event[], snapshot?: Snapshot): void {
        if (snapshot) {
            // Load state from snapshot
            Object.assign(this, snapshot.state);
            this._version = snapshot.version;
        }

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

    abstract getState(): any;
}

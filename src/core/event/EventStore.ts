// src/core/event/EventStore.ts
import type { Database } from "../../infrastructure/Database";
import type { Event } from "./Event";

export class EventStore {
    constructor(private db: Database) {}

    async save(event: Event): Promise<void> {
        await this.db.query(
            `INSERT INTO events 
       (event_id, aggregate_id, uid, event_type, version, timestamp, payload, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                event.id,
                event.aggregateId,
                event.uid,
                event.type,
                event.version,
                event.timestamp,
                event.payload,
                event.metadata || {},
            ]
        );
    }

    async getEvents(aggregateId: string): Promise<Event[]> {
        const result = await this.db.query(
            "SELECT * FROM events WHERE aggregate_id = $1 ORDER BY version ASC",
            [aggregateId]
        );
        return result.rows;
    }
}

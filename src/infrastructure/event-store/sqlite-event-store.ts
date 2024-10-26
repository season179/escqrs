import { Database } from "bun:sqlite";
import type { Event } from "../../domain/interfaces/event";
import type { EventStore } from "./event-store.interface";

export class SQLiteEventStore implements EventStore {
    private db: Database;

    constructor() {
        this.db = new Database("events.db");
        this.initializeDatabase();
    }

    private initializeDatabase(): void {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                type TEXT NOT NULL,
                payload TEXT NOT NULL,
                aggregateId TEXT NOT NULL,
                version INTEGER NOT NULL
            );
            
            CREATE INDEX IF NOT EXISTS idx_aggregateId 
            ON events(aggregateId);
        `);
    }

    async saveEvents(events: Event[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO events (id, timestamp, type, payload, aggregateId, version)
            VALUES ($id, $timestamp, $type, $payload, $aggregateId, $version)
        `);

        // Begin transaction
        this.db.transaction(() => {
            for (const event of events) {
                stmt.run({
                    $id: event.id,
                    $timestamp: event.timestamp.toISOString(),
                    $type: event.type,
                    $payload: JSON.stringify(event.payload),
                    $aggregateId: event.aggregateId,
                    $version: event.version,
                });
            }
        })();
    }

    async getEventById(aggregateId: string): Promise<Event[]> {
        const stmt = this.db.prepare(`
            SELECT * FROM events 
            WHERE aggregateId = $aggregateId 
            ORDER BY version ASC
        `);

        const rows = stmt.all({ $aggregateId: aggregateId }) as any[];

        return rows.map((row) => ({
            ...row,
            timestamp: new Date(row.timestamp),
            payload: JSON.parse(row.payload),
        }));
    }

    close(): void {
        // Bun's SQLite doesn't require explicit closing
    }
}

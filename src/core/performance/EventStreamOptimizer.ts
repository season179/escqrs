// src/core/performance/EventStreamOptimizer.ts
import type { Database } from "../../infrastructure/Database";
import { nanoid } from "nanoid";

export class EventStreamOptimizer {
    constructor(private db: Database) {}

    async createSnapshot(
        aggregateId: string,
        state: unknown,
        version: number
    ): Promise<void> {
        await this.db.query(
            `INSERT INTO snapshots (snapshot_id, aggregate_id, state, version, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (aggregate_id) 
       DO UPDATE SET state = $3, version = $4, created_at = $5`,
            [nanoid(), aggregateId, state, version, new Date()]
        );
    }

    async getLatestSnapshot(aggregateId: string): Promise<{
        state: unknown;
        version: number;
    } | null> {
        const result = await this.db.query(
            "SELECT state, version FROM snapshots WHERE aggregate_id = $1",
            [aggregateId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return {
            state: result.rows[0].state,
            version: result.rows[0].version,
        };
    }

    async pruneEvents(
        aggregateId: string,
        beforeVersion: number
    ): Promise<void> {
        await this.db.query(
            "DELETE FROM events WHERE aggregate_id = $1 AND version < $2",
            [aggregateId, beforeVersion]
        );
    }
}

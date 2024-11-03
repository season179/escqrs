// src/core/saga/SagaManager.ts
import { nanoid } from "nanoid";
import type { Database } from "../../infrastructure/Database";
import type { Saga } from "./Saga";
import { SagaStatus } from "./Saga";

export class SagaManager {
    constructor(private db: Database) {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS sagas (
        saga_id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        data JSONB NOT NULL,
        last_updated TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sagas_type ON sagas(type);
      CREATE INDEX IF NOT EXISTS idx_sagas_status ON sagas(status);
    `);
    }

    async create(type: string, data: unknown): Promise<string> {
        const sagaId = nanoid();
        await this.db.query(
            `INSERT INTO sagas (saga_id, type, status, data, last_updated)
       VALUES ($1, $2, $3, $4, $5)`,
            [sagaId, type, SagaStatus.STARTED, data, new Date()]
        );
        return sagaId;
    }

    async update(
        sagaId: string,
        status: SagaStatus,
        data: unknown
    ): Promise<void> {
        await this.db.query(
            `UPDATE sagas 
       SET status = $1, data = $2, last_updated = $3
       WHERE saga_id = $4`,
            [status, data, new Date(), sagaId]
        );
    }

    async get(sagaId: string): Promise<Saga | null> {
        const result = await this.db.query(
            "SELECT * FROM sagas WHERE saga_id = $1",
            [sagaId]
        );
        return result.rows[0] || null;
    }
}

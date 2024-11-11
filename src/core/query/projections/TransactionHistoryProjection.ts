// src/core/query/projections/TransactionHistoryProjection.ts
import type { Event } from "../../event/Event";
import type { EventHandler } from "../../event/EventHandler";
import type { Database } from "../../../infrastructure/Database";

export class TransactionHistoryProjection implements EventHandler {
    constructor(private db: Database) {}

    public async initialize(): Promise<void> {
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS transaction_history (
                transaction_id TEXT PRIMARY KEY,
                account_id TEXT NOT NULL,
                uid TEXT NOT NULL,
                type TEXT NOT NULL,
                amount DECIMAL NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                metadata JSONB
            );
            CREATE INDEX IF NOT EXISTS idx_transaction_history_uid ON transaction_history(uid);
            CREATE INDEX IF NOT EXISTS idx_transaction_history_timestamp ON transaction_history(timestamp);
        `);
    }

    async handle(event: Event): Promise<void> {
        await this.db.query(
            `
            INSERT INTO transaction_history (
                transaction_id,
                account_id,
                uid,
                type,
                amount,
                timestamp,
                metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `,
            [
                event.id,
                event.aggregateId,
                event.uid,
                event.type,
                (event.payload as { amount: number }).amount,
                event.timestamp,
                event.metadata || {},
            ]
        );
    }
}

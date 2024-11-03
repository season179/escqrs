// src/core/query/projections/TransactionHistoryProjection.ts
import { inject, injectable } from "tsyringe";
import type { Event } from "../../event/Event";
import type { EventHandler } from "../../event/EventHandler";
import type { Database } from "../../../infrastructure/Database";

@injectable()
export class TransactionHistoryProjection implements EventHandler {
    constructor(@inject("Database") private db: Database) {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS transaction_history (
        transaction_id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        ebid TEXT NOT NULL,
        type TEXT NOT NULL,
        amount DECIMAL NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        metadata JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_transaction_history_ebid ON transaction_history(ebid);
      CREATE INDEX IF NOT EXISTS idx_transaction_history_timestamp ON transaction_history(timestamp);
    `);
    }

    async handle(event: Event): Promise<void> {
        await this.db.query(
            `
      INSERT INTO transaction_history (
        transaction_id,
        account_id,
        ebid,
        type,
        amount,
        timestamp,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
            [
                event.id,
                event.aggregateId,
                event.ebid,
                event.type,
                (event.payload as { amount: number }).amount,
                event.timestamp,
                event.metadata || {},
            ]
        );
    }
}

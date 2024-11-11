// src/core/query/projections/AccountBalanceProjection.ts
import type { Event } from "../../event/Event";
import type { EventHandler } from "../../event/EventHandler";
import type { Database } from "../../../infrastructure/Database";

export class AccountBalanceProjection implements EventHandler {
    constructor(private db: Database) {}

    public async initialize(): Promise<void> {
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS account_balances (
                account_id TEXT PRIMARY KEY,
                uid TEXT NOT NULL,
                ebid TEXT,
                current_balance DECIMAL NOT NULL DEFAULT 0,
                last_updated TIMESTAMP NOT NULL,
                UNIQUE(uid)
            );
            CREATE INDEX IF NOT EXISTS idx_account_balances_uid ON account_balances(uid);
            CREATE INDEX IF NOT EXISTS idx_account_balances_ebid ON account_balances(ebid);
        `);
    }

    async handle(event: Event): Promise<void> {
        switch (event.type) {
            case "CREDIT_GRANTED":
                await this.handleCreditGranted(event);
                break;
            case "CREDIT_WITHDRAWN":
                await this.handleCreditWithdrawn(event);
                break;
        }
    }

    private async handleCreditGranted(event: Event): Promise<void> {
        const amount = (event.payload as { amount: number }).amount;
        await this.db.query(
            `
                INSERT INTO account_balances (account_id, uid, current_balance, last_updated)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (uid)
                DO UPDATE SET 
                    current_balance = account_balances.current_balance + $3,
                    last_updated = $4
            `,
            [event.aggregateId, event.uid, amount, event.timestamp]
        );
    }

    private async handleCreditWithdrawn(event: Event): Promise<void> {
        const amount = (event.payload as { amount: number }).amount;
        await this.db.query(
            `
                UPDATE account_balances 
                SET current_balance = current_balance - $1,
                    last_updated = $2
                WHERE uid = $3
            `,
            [amount, event.timestamp, event.uid]
        );
    }
}

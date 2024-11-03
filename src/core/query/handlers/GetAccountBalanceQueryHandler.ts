// src/core/query/handlers/GetAccountBalanceQueryHandler.ts
import type { QueryHandler } from "../QueryHandler";
import type { GetAccountBalanceQuery } from "../queries/GetAccountBalanceQuery";
import type { Database } from "../../../infrastructure/Database";

export class GetAccountBalanceQueryHandler implements QueryHandler {
    constructor(private db: Database) {}

    async handle(query: GetAccountBalanceQuery): Promise<{ balance: number }> {
        const result = await this.db.query(
            "SELECT current_balance FROM account_balances WHERE ebid = $1",
            [query.payload.ebid]
        );

        if (result.rows.length === 0) {
            return { balance: 0 };
        }

        return { balance: result.rows[0].current_balance };
    }
}

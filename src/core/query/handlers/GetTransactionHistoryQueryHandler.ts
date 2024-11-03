// src/core/query/handlers/GetTransactionHistoryQueryHandler.ts
import { inject, injectable } from "tsyringe";
import type { QueryHandler } from "../QueryHandler";
import type { GetTransactionHistoryQuery } from "../queries/GetTransactionHistoryQuery";
import type { Database } from "../../../infrastructure/Database";

@injectable()
export class GetTransactionHistoryQueryHandler implements QueryHandler {
    constructor(@inject("Database") private db: Database) {}

    async handle(query: GetTransactionHistoryQuery): Promise<{
        transactions: Array<{
            id: string;
            type: string;
            amount: number;
            timestamp: Date;
        }>;
        total: number;
    }> {
        const limit = query.payload.limit || 10;
        const offset = ((query.payload.page || 1) - 1) * limit;

        const [transactions, count] = await Promise.all([
            this.db.query(
                `SELECT transaction_id, type, amount, timestamp 
         FROM transaction_history 
         WHERE ebid = $1 
         ORDER BY timestamp DESC 
         LIMIT $2 OFFSET $3`,
                [query.payload.ebid, limit, offset]
            ),
            this.db.query(
                "SELECT COUNT(*) as total FROM transaction_history WHERE ebid = $1",
                [query.payload.ebid]
            ),
        ]);

        return {
            transactions: transactions.rows.map((row) => ({
                id: row.transaction_id,
                type: row.type,
                amount: row.amount,
                timestamp: row.timestamp,
            })),
            total: parseInt(count.rows[0].total),
        };
    }
}

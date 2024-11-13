import { pool, EventStore } from "./EventStore";
import { CreditGrantedEvent } from "./CreditGrantedEvent";

export class BalanceProjection {
    static async project(event: CreditGrantedEvent): Promise<void> {
        await EventStore.ensureBalanceTableExists();

        const query = `
            INSERT INTO balances (uid, balance)
            VALUES ($1, $2)
            ON CONFLICT (uid) DO UPDATE SET balance = balances.balance + $2
        `;
        const values = [event.uid, event.amount];

        await pool.query(query, values);
    }
}
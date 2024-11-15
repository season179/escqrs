import { pool, EventStore } from "./EventStore";
import { CreditGrantedEvent } from "./credit-granting/CreditGrantedEvent";
import { WithdrawalEvent } from "./withdrawal/WithdrawalEvent";

export class BalanceProjection {
    static async project(
        event: CreditGrantedEvent | WithdrawalEvent
    ): Promise<void> {
        await EventStore.ensureBalanceTableExists();

        let amount: number;
        if (event instanceof CreditGrantedEvent) {
            amount = event.amount;
        } else if (event instanceof WithdrawalEvent) {
            amount = -event.amount;
        } else {
            throw new Error("Unsupported event type");
        }

        const query = `
            INSERT INTO balances (uid, balance)
            VALUES ($1, $2)
            ON CONFLICT (uid) DO UPDATE SET balance = balances.balance + $2
        `;
        const values = [event.uid, amount];

        await pool.query(query, values);
    }
}

import { WithdrawalEvent } from "./WithdrawalEvent";
import { BalanceProjection } from "./BalanceProjection";

export class WithdrawalEventHandler {
    public async handle(event: WithdrawalEvent): Promise<void> {
        const { uid, amount } = event;

        // Call the BalanceProjection to update the read model
        await BalanceProjection.project(event);

        console.log(`Withdrawal processed: ${amount} for user ${uid}`);
    }
}

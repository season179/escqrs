import { CreditGrantedEvent } from "./CreditGrantedEvent";
import { BalanceProjection } from "./BalanceProjection";

export class CreditGrantedEventHandler {
    public async handle(event: CreditGrantedEvent): Promise<void> {
        const { uid, amount } = event;

        // Call the BalanceProjection to update the read model
        await BalanceProjection.project(event);

        console.log(`Credits granted: ${amount} for user ${uid}`);
    }
}

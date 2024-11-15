import { EventStore } from "../EventStore";
import { WithdrawalEvent } from "./WithdrawalEvent";
import { WithdrawalEventHandler } from "./WithdrawalEventHandler";

export class WithdrawalCommandHandler {
    public async handle(command: {
        uid: string;
        amount: number;
    }): Promise<void> {
        const { uid, amount } = command;

        // Create the event
        const event = new WithdrawalEvent(uid, amount);

        // Persist the event in PostgreSQL (via EventStore)
        await EventStore.save(event);

        // Handle the event
        const eventHandler = new WithdrawalEventHandler();
        await eventHandler.handle(event);
    }
}

// src/commandHandlers/GrantCreditsCommandHandler.ts

import { EventStore } from "../EventStore"; // Event storage for persisting to PostgreSQL
import { CreditGrantedEvent } from "./CreditGrantedEvent";
import { CreditGrantedEventHandler } from "./CreditGrantedEventHandler";

export class GrantCreditsCommandHandler {
    public async handle(command: {
        uid: string;
        amount: number;
    }): Promise<void> {
        const { uid, amount } = command;

        // Create the event
        const event = new CreditGrantedEvent(uid, amount);

        // Persist the event in PostgreSQL (via EventStore)
        await EventStore.save(event);

        // Handle the event (e.g., apply business logic)
        const eventHandler = new CreditGrantedEventHandler();
        await eventHandler.handle(event);
    }
}

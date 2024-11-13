

import { CreditGrantedEvent } from './CreditGrantedEvent';

export class CreditGrantedEventHandler {
    public async handle(event: CreditGrantedEvent): Promise<void> {
        const { uid, amount } = event;

        // Implement business logic (e.g., update read model, notify other services, etc.)
        console.log(`Credits granted: ${amount} for user ${uid}`);
        // Add additional handling as needed
    }
}
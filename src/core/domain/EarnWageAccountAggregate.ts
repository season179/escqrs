// src/core/domain/EarnWageAccountAggregate.ts
import { nanoid } from "nanoid";
import type { Event } from "../event/Event";
import { DomainError } from "../errors/DomainError";

export class EarnWageAccountAggregate {
    private id: string;
    private ebid: string;
    private balance: number = 0;
    private version: number = 0;

    constructor(ebid: string) {
        this.id = nanoid();
        this.ebid = ebid;
    }

    applyEvent(event: Event): void {
        switch (event.type) {
            case "CREDIT_GRANTED":
                this.balance += (event.payload as { amount: number }).amount;
                break;
            case "CREDIT_WITHDRAWN":
                this.balance -= (event.payload as { amount: number }).amount;
                break;
        }
        this.version = event.version;
    }

    grantCredit(amount: number): Event {
        return {
            id: nanoid(),
            type: "CREDIT_GRANTED",
            aggregateId: this.id,
            ebid: this.ebid,
            version: this.version + 1,
            timestamp: new Date(),
            payload: { amount },
        };
    }

    withdrawCredit(amount: number): Event {
        if (amount > this.balance) {
            throw new DomainError("Insufficient balance");
        }

        return {
            id: nanoid(),
            type: "CREDIT_WITHDRAWN",
            aggregateId: this.id,
            ebid: this.ebid,
            version: this.version + 1,
            timestamp: new Date(),
            payload: { amount },
        };
    }

    processReversal(transactionId: string, amount: number): Event {
        return {
            id: nanoid(),
            type: "REVERSAL_PROCESSED",
            aggregateId: this.id,
            ebid: this.ebid,
            version: this.version + 1,
            timestamp: new Date(),
            payload: { transactionId, amount },
            metadata: { originalBalance: this.balance },
        };
    }

    resetAccount(): Event {
        return {
            id: nanoid(),
            type: "ACCOUNT_RESET",
            aggregateId: this.id,
            ebid: this.ebid,
            version: this.version + 1,
            timestamp: new Date(),
            payload: { previousBalance: this.balance },
        };
    }

    getId(): string {
        return this.id;
    }

    getEbid(): string {
        return this.ebid;
    }

    getBalance(): number {
        return this.balance;
    }

    getVersion(): number {
        return this.version;
    }
}
// src/domain/EarnWageAccount.ts
import { nanoid } from "nanoid";
import type { Event } from "../core/event/Event";

export class EarnWageAccount {
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

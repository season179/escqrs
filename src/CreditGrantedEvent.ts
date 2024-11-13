// src/events/CreditGrantedEvent.ts

export class CreditGrantedEvent {
    constructor(public readonly uid: string, public readonly amount: number) {}
}
import { Event } from "./Event";

export class WithdrawalEvent extends Event {
    constructor(uid: string, public readonly amount: number) {
        super(uid);
    }
}

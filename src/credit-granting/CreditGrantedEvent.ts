import { Event } from "../Event";

export class CreditGrantedEvent extends Event {
    constructor(uid: string, public readonly amount: number) {
        super(uid);
    }
}

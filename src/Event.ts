import { customAlphabet } from "nanoid";

export abstract class Event {
    public readonly eventId: string;

    constructor(public readonly uid: string) {
        // To accomodate 100,000 events per second
        // Speed: 100,000 IDs per second
        // ~6 thousand years or 18,660T IDs needed, 
        // in order to have a 1% probability of at least one collision.
        this.eventId = `EVT${customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 22)()}`;
    }
}

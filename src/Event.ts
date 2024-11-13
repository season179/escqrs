import { nanoid } from "nanoid";

export abstract class Event {
    public readonly eventId: string;

    constructor(public readonly uid: string) {
        this.eventId = `evt-${nanoid()}`;
    }
}

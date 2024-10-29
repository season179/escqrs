import { v4 as uuidv4 } from "uuid";
import type { Event } from "../event/types";

export abstract class Saga {
    id: string;
    state: string;
    data: any;
    createdAt: Date;
    updatedAt: Date;
    timeoutAt?: Date;

    constructor(data: any, id?: string) {
        this.id = id || uuidv4();
        this.state = "Started";
        this.data = data;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Starts the saga by executing the initial action
     */
    abstract start(): Promise<void>;

    /**
     * Handles events that are relevant to the saga
     * @param event The event to handle
     */
    abstract handleEvent(event: Event): Promise<void>;

    /**
     * Determines if the saga is completed
     */
    abstract isCompleted(): boolean;

    hasTimedOut(): boolean {
        if (!this.timeoutAt) {
            return false;
        }
        return new Date() > this.timeoutAt;
    }
}

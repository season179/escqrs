import { AggregateRoot } from "../../aggregate/AggregateRoot";
import type { Event } from "../../event/types";
import { nanoid } from "nanoid";


interface UserState {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
}

export class User extends AggregateRoot {
    private state: UserState = {
        id: "",
        email: "",
        name: "",
        isActive: false,
    }

    constructor(id: string) {
        super(id);
        this.state.id = id;
    }

    // Command methods
    create(email: string, name: string): void {
        this.apply({
            id: nanoid(),
            type: "UserCreated",
            aggregateId: this.id,
            aggregateType: "User",
            version: this.version + 1,
            payload: {
                email,
                name,
            },
            metadata: {},
            timestamp: new Date(),
        });
    }

    updateProfile(name: string): void {
        if (!this.state.isActive) {
            throw new Error("User is not active");
        }

        this.apply({
            id: nanoid(),
            type: "UserProfileUpdated",
            aggregateId: this.id,
            aggregateType: "User",
            version: this.version + 1,
            payload: { name },
            metadata: {},
            timestamp: new Date(),
        });
    }

    deactivate(): void {
        if (!this.state.isActive) {
            throw new Error("User is already inactive");
        }

        this.apply({
            id: nanoid(),
            type: "UserDeactivated",
            aggregateId: this.id,
            aggregateType: "User",
            version: this.version + 1,
            payload: {},
            metadata: {},
            timestamp: new Date(),
        });
    }

    // Event handlers
    onUserCreated(event: Event): void {
        this.state.email = event.payload.email;
        this.state.name = event.payload.name;
        this.state.isActive = true;
    }

    onUserProfileUpdated(event: Event): void {
        this.state.name = event.payload.name;
    }

    onUserDeactivated(event: Event): void {
        this.state.isActive = false;
    }

    getState(): UserState {
        return { ...this.state };
    }
}

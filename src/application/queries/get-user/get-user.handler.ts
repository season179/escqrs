import { SQLiteEventStore } from "../../../infrastructure/event-store/sqlite-event-store";
import type { GetUserQuery } from "./get-user.query";

export class GetUserQueryHandler {
    constructor(private readonly eventStore: SQLiteEventStore) {}

    async handle(query: GetUserQuery) {
        const events = await this.eventStore.getEventById(query.payload.userId);
        
        if (!events.length) {
            throw new Error(`User with ID ${query.payload.userId} not found`);
        }

        // Reconstruct user state from events
        const user = events.reduce((user, event) => {
            switch (event.type) {
                case "UserCreated":
                    return {
                        id: event.aggregateId,
                        name: event.payload.name,
                        email: event.payload.email,
                    };
                // Add other event cases here as needed
                default:
                    return user;
            }
        }, {});

        return user;
    }
}
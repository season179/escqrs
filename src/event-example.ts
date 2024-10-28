// Example usage
import { DatabaseFactory } from "./persistence";
import { EventStore } from "./event";
import type { EventData } from "./event";

async function example() {
    // Initialize database
    const db = DatabaseFactory.createAdapter("postgresql", {
        host: "localhost",
        database: "eventstore",
        username: "user",
        password: "password",
    });
    await db.connect();

    // Initialize event store
    const eventStore = new EventStore(db, {
        snapshotFrequency: 100,
    });
    await eventStore.initialize();

    // Append events
    const event: EventData = {
        id: "1",
        aggregateId: "user-123",
        aggregateType: "User",
        type: "UserCreated",
        version: 1,
        payload: { name: "John Doe" },
        metadata: { userId: "admin" },
        timestamp: new Date(),
    };

    await eventStore.appendToStream([event]);

    // Retrieve events
    const events = await eventStore.getEventStream("user-123");
    console.log(events);
}

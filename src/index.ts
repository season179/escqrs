import { SQLiteEventStore } from "./infrastructure/event-store/sqlite-event-store";
import { CreateUserCommandHandler } from "./application/commands/create-user/create-user.handler";
import type { CreateUserCommand } from "./application/commands/create-user/create-user.command";

async function main() {
    const eventStore = new SQLiteEventStore();
    const commandHandler = new CreateUserCommandHandler(eventStore);

    const createUserCommand: CreateUserCommand = {
        type: "CreateUser",
        payload: {
            name: "John Doe",
            email: "john@example.com",
        },
    };

    try {
        const userId = await commandHandler.handle(createUserCommand);
        console.log("User created with ID:", userId);

        const events = await eventStore.getEventById(userId);
        console.log("Stored events:", events);
    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        eventStore.close();
    }
}

main();

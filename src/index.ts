import { SQLiteEventStore } from "./infrastructure/event-store/sqlite-event-store";
import { CreateUserCommandHandler } from "./application/commands/create-user/create-user.handler";
import type { CreateUserCommand } from "./application/commands/create-user/create-user.command";
import { GetUserQueryHandler } from "./application/queries/get-user/get-user.handler";
import type { GetUserQuery } from "./application/queries/get-user/get-user.query";

async function main() {
    const eventStore = new SQLiteEventStore();
    const commandHandler = new CreateUserCommandHandler(eventStore);
    const queryHandler = new GetUserQueryHandler(eventStore);

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

        const getUserQuery: GetUserQuery = {
            type: "GetUser",
            payload: {
                userId: userId, // Using the ID from the created user
            },
        };

        const user = await queryHandler.handle(getUserQuery);
        console.log("Retrieved user:", user);

    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        eventStore.close();
    }
}

main();

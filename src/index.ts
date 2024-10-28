import { SQLiteEventStore } from "./infrastructure/event-store/sqlite-event-store";
import { CreateUserCommandHandler } from "./application/commands/create-user/create-user.handler";
import type { CreateUserCommand } from "./application/commands/create-user/create-user.command";
import { GetUserQueryHandler } from "./application/queries/get-user/get-user.handler";
import type { GetUserQuery } from "./application/queries/get-user/get-user.query";
import { UpdateUserCommandHandler } from "./application/commands/update-user/update-user.handler";
import type { UpdateUserCommand } from "./application/commands/update-user/update-user.command";

async function main() {
    const eventStore = new SQLiteEventStore();
    const createCommandHandler = new CreateUserCommandHandler(eventStore);
    const updateCommandHandler = new UpdateUserCommandHandler(eventStore);
    const queryHandler = new GetUserQueryHandler(eventStore);

    try {
        // Create user
        const createUserCommand: CreateUserCommand = {
            type: "CreateUser",
            payload: {
                name: "Jane Smith",
                email: "smith@example.com",
            },
        };

        const userId = await createCommandHandler.handle(createUserCommand);
        console.log("User created with ID:", userId);

        // Update user
        const updateUserCommand: UpdateUserCommand = {
            type: "UpdateUser",
            payload: {
                userId: userId,
                name: "Jane Updated",
                email: "smith.updated@example.com",
            },
        };

        await updateCommandHandler.handle(updateUserCommand);
        console.log("User updated successfully");

        // Get updated user
        const getUserQuery: GetUserQuery = {
            type: "GetUser",
            payload: {
                userId: userId,
            },
        };

        const updatedUser = await queryHandler.handle(getUserQuery);
        console.log("Retrieved updated user:", updatedUser);
    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        eventStore.close();
    }
}

main();

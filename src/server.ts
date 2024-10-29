import Fastify from "fastify";
import { nanoid } from "nanoid";
import { DatabaseFactory } from "./persistence";
import { EventStore } from "./event";
import { CommandGateway, CommandBus } from "./command";
import { QueryGateway } from "./query/QueryGateway";
import { QueryBus } from "./query/QueryBus";
import { EventBus } from "./event/EventBus";
import {
    CreateUserHandler,
    UpdateUserProfileHandler,
    DeactivateUserHandler,
} from "./domain/user/commandHandlers";
import { GetUserHandler } from "./domain/user/queryHandlers";

const fastify = Fastify({ logger: true });

async function startServer() {
    // Initialise SQLite database
    const db = DatabaseFactory.createAdapter("sqlite", {
        filename: "database.db",
        database: "main",
    });
    await db.connect();

    const eventBus = new EventBus();
    const eventStore = new EventStore(db, eventBus);
    await eventStore.initialize();

    const commandBus = new CommandBus();
    const queryBus = new QueryBus();

    const commandGateway = new CommandGateway(commandBus);
    const queryGateway = new QueryGateway(queryBus);

    // Register command handlers
    console.log(eventStore);
    commandBus.register("CreateUser", new CreateUserHandler(eventStore));
    commandBus.register(
        "UpdateUserProfile",
        new UpdateUserProfileHandler(eventStore)
    );
    commandBus.register(
        "DeactivateUser",
        new DeactivateUserHandler(eventStore)
    );

    // Register query handlers
    queryBus.register("GetUser", new GetUserHandler(eventStore));

    // Start the server
    try {
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        fastify.log.info(`Server listening on http://localhost:3000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }

    // Endpoint to create a new user
    fastify.post("/users", async (request, reply) => {
        const { email, name } = request.body as { email: string; name: string };
        const userId = nanoid();
        await commandGateway.send("CreateUser", { id: userId, email, name });
        reply.send({ id: userId });
    });

    // Endpoint to update a user by id
    fastify.put("/users/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const { name } = request.body as { name: string };
        await commandGateway.send("UpdateUserProfile", { id, name });
        reply.send({ status: "User updated" });
    });

    // Endpoint to deactivate a user by id
    fastify.delete("/users/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        await commandGateway.send("DeactivateUser", { id });
        reply.send({ status: "User deactivated" });
    });

    
}

startServer();

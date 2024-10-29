import express from "express";
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

const app = express();
app.use(express.json());

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

    // Endpoint to create a new user
    app.post("/users", async (req, res) => {
        try {
            const { email, name } = req.body;
            const userId = nanoid();
            await commandGateway.send("CreateUser", {
                id: userId,
                email,
                name,
            });
            res.json({ id: userId });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });

    app.get("/users", async (req, res) => {
        res.json({ id: "hello" });
    });

    // Endpoint to get a user by id
    // FIXME: Give the res a proper type
    app.get("/users/:id", async (req, res: any) => {
        try {
            const { id } = req.params;
            const user = await queryGateway.ask("GetUser", { id });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Endpoint to update a user by id
    app.put("/users/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            await commandGateway.send("UpdateUserProfile", { id, name });
            res.json({ status: "User updated" });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Endpoint to deactivate a user by id
    app.delete("/users/:id", async (req, res) => {
        try {
            const { id } = req.params;
            await commandGateway.send("DeactivateUser", { id });
            res.json({ status: "User deactivated" });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Start the server
    try {
        app.listen(3000, "0.0.0.0", () => {
            console.log(`Server listening on http://localhost:3000`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

startServer();

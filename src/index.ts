import Fastify from "fastify";
import creditGrantingRoutes from "./credit-granting/creditGrantingRoutes";
import { WithdrawalCommandHandler } from "./WithdrawalCommandHandler";
import { EventStore, pool } from "./EventStore";

const fastify = Fastify();

// Register the credit granting routes
fastify.register(creditGrantingRoutes);

fastify.post("/withdraw", async (request, reply) => {
    try {
        const { uid, amount } = request.body as { uid: string; amount: number };

        if (amount <= 0) {
            reply.status(400).send({ error: "Amount must be greater than 0" });
            return;
        }

        // Check if the user has sufficient balance
        const query = "SELECT balance FROM balances WHERE uid = $1";
        const result = await pool.query(query, [uid]);

        let balance = 0;
        if (result.rows.length > 0) {
            balance = parseFloat(result.rows[0].balance);
        }

        if (balance < amount) {
            reply.status(400).send({ error: "Insufficient balance" });
            return;
        }

        const handler = new WithdrawalCommandHandler();
        await handler.handle({ uid, amount });

        reply.send({ message: "Withdrawal successful" });
    } catch (error) {
        console.error("Error during withdrawal:", error);
        reply
            .status(500)
            .send({ error: "An error occurred while processing withdrawal" });
    }
});

fastify.get("/balance/:uid", async (request, reply) => {
    const { uid } = request.params as { uid: string };

    try {
        const query = "SELECT balance FROM balances WHERE uid = $1";
        const result = await pool.query(query, [uid]);

        if (result.rows.length === 0) {
            reply.status(404).send({ error: "User not found" });
            return;
        }

        reply.send({ uid, balance: parseFloat(result.rows[0].balance) });
    } catch (error) {
        console.error("Error fetching balance:", error);
        reply
            .status(500)
            .send({ error: "An error occurred while fetching balance" });
    }
});

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});

// Add shutdown handlers
process.on("SIGTERM", async () => {
    try {
        console.log("Received SIGTERM, shutting down gracefully");
        await fastify.close(); // First close fastify server
        await EventStore.cleanup(); // Then cleanup DB connections
        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
    }
});

process.on("SIGINT", async () => {
    try {
        console.log("Received SIGINT, shutting down gracefully");
        await fastify.close(); // First close fastify server
        await EventStore.cleanup(); // Then cleanup DB connections
        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
    }
});

import Fastify from "fastify";
import { GrantCreditsCommandHandler } from "./GrantCreditsCommandHandler";
import { EventStore } from "./EventStore";

const fastify = Fastify();

fastify.post("/grant-credits", async (request, reply) => {
    const { uid, amount } = request.body as { uid: string; amount: number };

    if (amount <= 0) {
        reply.status(400).send({ error: "Amount must be greater than 0" });
        return;
    }

    const handler = new GrantCreditsCommandHandler();
    await handler.handle({ uid, amount });

    reply.send({ message: "Credits granted successfully" });
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

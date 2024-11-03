// src/api/routes/health.ts
import type { FastifyInstance } from "fastify";
import { ServiceContainer } from "../../core/container/ServiceContainer";
import type { Database } from "../../infrastructure/Database";
import type { RedisMessageBroker } from "../../infrastructure/RedisMessageBroker";

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
    const container = ServiceContainer.getInstance();
    const db = container.resolve<Database>("Database");
    const messageBroker =
        container.resolve<RedisMessageBroker>("MessageBroker");

    fastify.get("/health", async (request, reply) => {
        try {
            // Check database connection
            await db.query("SELECT 1");

            // Check Redis connection
            await messageBroker.publish("health-check", {
                timestamp: new Date(),
            });

            return reply.status(200).send({
                status: "healthy",
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            return reply.status(503).send({
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
}

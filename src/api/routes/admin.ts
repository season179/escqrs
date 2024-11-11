// src/api/routes/admin.ts
import type { FastifyInstance } from "fastify";
import { ServiceContainer } from "../../core/container/ServiceContainer";
import type { EventBus } from "../../core/event/EventBus";
import { nanoid } from "nanoid";

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
    const container = ServiceContainer.getInstance();
    const eventBus = container.resolve<EventBus>("EventBus");

    fastify.post("/admin/monthly-reset", async (request, reply) => {
        await eventBus.publish({
            id: nanoid(),
            type: "MONTHLY_RESET_TRIGGERED",
            aggregateId: "system",
            uid: "system",
            version: 1,
            timestamp: new Date(),
            payload: { triggeredAt: new Date() },
        });
        return reply.status(202).send();
    });
}

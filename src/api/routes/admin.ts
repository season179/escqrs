// src/api/routes/admin.ts
import type { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import type { EventBus } from "../../core/event/EventBus";
import { nanoid } from "nanoid";

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
    const eventBus = container.resolve<EventBus>("EventBus");

    fastify.post("/admin/monthly-reset", async (request, reply) => {
        await eventBus.publish({
            id: nanoid(),
            type: "MONTHLY_RESET_TRIGGERED",
            aggregateId: "system",
            ebid: "system",
            version: 1,
            timestamp: new Date(),
            payload: { triggeredAt: new Date() },
        });
        return reply.status(202).send();
    });
}

// src/api/routes/metrics.ts
import type { FastifyInstance } from "fastify";
import { ServiceContainer } from "../../core/container/ServiceContainer";
import { Metrics } from "../../core/monitoring/Metrics";

export async function metricsRoutes(fastify: FastifyInstance): Promise<void> {
    const container = ServiceContainer.getInstance();
    const metrics = container.resolve<Metrics>("Metrics");

    fastify.get("/metrics", async (request, reply) => {
        return reply
            .header("Content-Type", "text/plain")
            .send(await metrics.getMetrics());
    });
}

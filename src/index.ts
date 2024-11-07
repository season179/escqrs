// index.ts
import "./config/env.config";
import Fastify from "fastify";
import { initializeContainer } from "./config/container.config";
import { accountRoutes } from "./api/routes/accounts";
import { queryRoutes } from "./api/routes/queries";
import { adminRoutes } from "./api/routes/admin";
import { metricsRoutes } from "./api/routes/metrics";
import { healthRoutes } from "./api/routes/health";
import { ServiceContainer } from "./core/container/ServiceContainer";
import { Database } from "./infrastructure/Database";
import { RedisMessageBroker } from "./infrastructure/RedisMessageBroker";

// Initialize the container
initializeContainer();

const fastify = Fastify({
    logger: true,
});

const container = ServiceContainer.getInstance();
const db = container.resolve<Database>("Database");
const messageBroker = container.resolve<RedisMessageBroker>("MessageBroker");

async function checkServicesReady() {
    try {
        // Check if Postgres is ready
        await db.query("SELECT 1");
    } catch (error) {
        fastify.log.error(
            "Postgres is not ready: " +
                (error instanceof Error ? error.message : "Unknown error")
        );
        process.exit(1);
    }

    try {
        // Check if Redis is ready
        await messageBroker.checkReady();
    } catch (error) {
        fastify.log.error(
            "Redis is not ready: " +
                (error instanceof Error ? error.message : "Unknown error")
        );
        process.exit(1);
    }
}

(async () => {
    await checkServicesReady();

    fastify.register(accountRoutes);
    fastify.register(queryRoutes);
    fastify.register(adminRoutes);
    fastify.register(metricsRoutes);
    fastify.register(healthRoutes);

    fastify.listen({ port: 3000 }, (err) => {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
    });
})();

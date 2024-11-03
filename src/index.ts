import "./config/env.config";
import { initializeContainer } from "./config/container.config";
import Fastify from "fastify";
import { accountRoutes } from "./api/routes/accounts";
import { queryRoutes } from "./api/routes/queries";
import { adminRoutes } from "./api/routes/admin";
import { metricsRoutes } from "./api/routes/metrics";

// Initialize the container
initializeContainer();

const fastify = Fastify({
    logger: true,
});

fastify.register(accountRoutes);
fastify.register(queryRoutes);
fastify.register(adminRoutes);
fastify.register(metricsRoutes);

fastify.listen({ port: 3000 }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});

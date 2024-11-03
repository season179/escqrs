// src/index.ts
import Fastify from "fastify";
import "./config/tsyringe.config";
import { accountRoutes } from "./api/routes/accounts";
import { queryRoutes } from "./api/routes/queries";
import { adminRoutes } from "./api/routes/admin";

const fastify = Fastify({
    logger: true,
});

fastify.register(accountRoutes);
fastify.register(queryRoutes);
fastify.register(adminRoutes);

fastify.listen({ port: 3000 }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});

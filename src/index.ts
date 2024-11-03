// src/index.ts
import Fastify from "fastify";
import "./config/tsyringe.config";
import { accountRoutes } from "./api/routes/accounts";

const fastify = Fastify({
    logger: true,
});

fastify.register(accountRoutes);

fastify.listen({ port: 3000 }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});

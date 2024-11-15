// credit_granting/creditGrantingRoutes.ts
import type { FastifyPluginAsync } from "fastify";
import { GrantCreditsCommandHandler } from "./GrantCreditsCommandHandler";

const creditGrantingRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/grant-credits", async (request, reply) => {
        try {
            const { uid, amount } = request.body as {
                uid: string;
                amount: number;
            };

            if (amount <= 0) {
                reply
                    .status(400)
                    .send({ error: "Amount must be greater than 0" });
                return;
            }

            const handler = new GrantCreditsCommandHandler();
            await handler.handle({ uid, amount });

            reply.send({ message: "Credits granted successfully" });
        } catch (error) {
            console.error("Error granting credits:", error);
            reply
                .status(500)
                .send({ error: "An error occurred while granting credits" });
        }
    });
};

export default creditGrantingRoutes;

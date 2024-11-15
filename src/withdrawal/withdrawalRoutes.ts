// withdrawal/withdrawalRoutes.ts
import type { FastifyPluginAsync } from "fastify";
import { WithdrawalCommandHandler } from "./WithdrawalCommandHandler";
import { pool } from "../EventStore";

const withdrawalRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/withdraw", async (request, reply) => {
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

            // Check if the user has sufficient balance
            const query = "SELECT balance FROM balances WHERE uid = $1";
            const result = await pool.query(query, [uid]);

            let balance = 0;
            if (result.rows.length > 0) {
                balance = parseFloat(result.rows[0].balance);
            }

            if (balance < amount) {
                reply.status(400).send({ error: "Insufficient balance" });
                return;
            }

            const handler = new WithdrawalCommandHandler();
            await handler.handle({ uid, amount });

            reply.send({ message: "Withdrawal successful" });
        } catch (error) {
            console.error("Error during withdrawal:", error);
            reply
                .status(500)
                .send({
                    error: "An error occurred while processing withdrawal",
                });
        }
    });
};

export default withdrawalRoutes;

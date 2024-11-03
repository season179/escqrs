// src/api/routes/accounts.ts
import type { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import type { CommandBus } from "../../core/command/CommandBus";

export async function accountRoutes(fastify: FastifyInstance): Promise<void> {
    const commandBus = container.resolve<CommandBus>("CommandBus");

    fastify.post<{ Params: { ebid: string }; Body: { amount: number } }>(
        "/accounts/:ebid/credits",
        async (request, reply) => {
            await commandBus.dispatch({
                type: "GRANT_CREDIT",
                payload: {
                    ebid: request.params.ebid,
                    amount: request.body.amount,
                },
            });
            return reply.status(202).send();
        }
    );

    fastify.post<{ Params: { ebid: string }; Body: { amount: number } }>(
        "/accounts/:ebid/withdrawals",
        async (request, reply) => {
            await commandBus.dispatch({
                type: "WITHDRAW_CREDIT",
                payload: {
                    ebid: request.params.ebid,
                    amount: request.body.amount,
                },
            });
            return reply.status(202).send();
        }
    );
}

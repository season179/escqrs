// src/api/routes/queries.ts
import type { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import type { QueryBus } from "../../core/query/QueryBus";

export async function queryRoutes(fastify: FastifyInstance): Promise<void> {
    const queryBus = container.resolve<QueryBus>("QueryBus");

    fastify.get<{ Params: { ebid: string } }>(
        "/accounts/:ebid/balance",
        async (request, reply) => {
            const result = await queryBus.execute({
                type: "GET_ACCOUNT_BALANCE",
                payload: {
                    ebid: request.params.ebid,
                },
            });
            return reply.send(result);
        }
    );

    fastify.get<{
        Params: { ebid: string };
        Querystring: { page?: number; limit?: number };
    }>("/accounts/:ebid/transactions", async (request, reply) => {
        const result = await queryBus.execute({
            type: "GET_TRANSACTION_HISTORY",
            payload: {
                ebid: request.params.ebid,
                page: request.query.page,
                limit: request.query.limit,
            },
        });
        return reply.send(result);
    });
}

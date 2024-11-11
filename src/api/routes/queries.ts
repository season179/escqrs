// src/api/routes/queries.ts
import type { FastifyInstance } from "fastify";
import { ServiceContainer } from "../../core/container/ServiceContainer";
import type { QueryBus } from "../../core/query/QueryBus";

export async function queryRoutes(fastify: FastifyInstance): Promise<void> {
    const container = ServiceContainer.getInstance();
    const queryBus = container.resolve<QueryBus>("QueryBus");

    fastify.get<{ Params: { uid: string } }>(
        "/accounts/:uid/balance",
        async (request, reply) => {
            const result = await queryBus.execute({
                type: "GET_ACCOUNT_BALANCE",
                payload: {
                    uid: request.params.uid,
                },
            });
            return reply.send(result);
        }
    );

    fastify.get<{
        Params: { uid: string };
        Querystring: { page?: number; limit?: number };
    }>("/accounts/:uid/transactions", async (request, reply) => {
        const result = await queryBus.execute({
            type: "GET_TRANSACTION_HISTORY",
            payload: {
                uid: request.params.uid,
                page: request.query.page,
                limit: request.query.limit,
            },
        });
        return reply.send(result);
    });
}

// src/api/routes/accounts.ts
import type { FastifyInstance } from "fastify";
import { ServiceContainer } from "../../core/container/ServiceContainer";
import type { CommandBus } from "../../core/command/CommandBus";

export async function accountRoutes(fastify: FastifyInstance): Promise<void> {
    const container = ServiceContainer.getInstance();
    const commandBus = container.resolve<CommandBus>("CommandBus");

    fastify.post<{
        Params: { identifier: string };
        Body: { amount: number };
    }>("/accounts/:identifier/credits", async (request, reply) => {
        const { identifier } = request.params;
        const isEbid = identifier.startsWith("EPM"); // `ebid` always starts with `EPM`

        const abc = await commandBus.dispatch({
            type: "GRANT_CREDIT",
            payload: {
                uid: isEbid ? undefined : identifier,
                ebid: isEbid ? identifier : undefined,
                amount: request.body.amount,
            },
        });

        console.log(abc);

        return reply.status(202).send();
    });

    fastify.post<{ Params: { uid: string }; Body: { amount: number } }>(
        "/accounts/:uid/withdrawals",
        async (request, reply) => {
            await commandBus.dispatch({
                type: "WITHDRAW_CREDIT",
                payload: {
                    uid: request.params.uid,
                    amount: request.body.amount,
                },
            });
            return reply.status(202).send();
        }
    );
}

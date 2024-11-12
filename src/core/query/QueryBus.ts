// src/core/query/QueryBus.ts
import { nanoid } from "nanoid";
import type { Query } from "./Query";
import type { QueryHandler } from "./QueryHandler";
import type { AzureServiceBusMessageBroker } from "../../infrastructure/AzureServiceBusMessageBroker";

export class QueryBus {
    private handlers = new Map<string, QueryHandler>();
    private readonly QUERY_CHANNEL = "escqrs-queries";
    private readonly RESPONSE_CHANNEL_PREFIX = "query_response:";

    constructor(private messageBroker: AzureServiceBusMessageBroker) {
        this.setupQuerySubscription();
    }

    private async setupQuerySubscription(): Promise<void> {
        await this.messageBroker.subscribe(
            this.QUERY_CHANNEL,
            async (message: unknown) => {
                const query = message as Query;
                const handler = this.handlers.get(query.type);
                if (handler) {
                    const result = await handler.handle(query);
                    await this.messageBroker.publish(
                        `${this.RESPONSE_CHANNEL_PREFIX}${query.type}`,
                        { data: result }
                    );
                }
            }
        );
    }

    register(queryType: string, handler: QueryHandler): void {
        this.handlers.set(queryType, handler);
    }

    async execute<T>(query: Query): Promise<T> {
        const queryId = nanoid();
        const responseChannel = `${this.RESPONSE_CHANNEL_PREFIX}${query.type}`;

        const responsePromise = new Promise<T>((resolve) => {
            this.messageBroker.subscribe(
                responseChannel,
                async (message: unknown) => {
                    const response = message as { data: T };
                    resolve(response.data);
                }
            );
        });

        await this.messageBroker.publish(this.QUERY_CHANNEL, {
            ...query,
            id: queryId,
        });

        return responsePromise;
    }
}

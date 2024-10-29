import { v4 as uuidv4 } from "uuid";
import type { Query, QueryResult } from "./types";
import { QueryBus } from "./QueryBus";

export class QueryGateway {
    constructor(private queryBus: QueryBus) {}

    async ask<T extends QueryResult>(
        queryType: string,
        parameters: any,
        metadata: Record<string, any> = {}
    ): Promise<T> {
        const query: Query = {
            id: uuidv4(),
            type: queryType,
            parameters,
            metadata,
            timestamp: new Date(),
        };

        return (await this.queryBus.execute(query)) as T;
    }
}

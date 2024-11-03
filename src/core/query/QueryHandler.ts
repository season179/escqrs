// src/core/query/QueryHandler.ts
import type { Query } from "./Query";

export interface QueryHandler {
    handle(query: Query): Promise<unknown>;
}

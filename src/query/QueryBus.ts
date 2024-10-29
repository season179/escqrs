import { v4 as uuidv4 } from "uuid";
import type {
    Query,
    QueryResult,
    QueryHandler,
    QueryMiddleware,
} from "./types";
import { QueryHandlerNotFoundError } from "./types";

export class QueryBus {
    private handlers = new Map<string, QueryHandler>();
    private middlewares: QueryMiddleware[] = [];

    /**
     * Register a query handler for a specific query type
     */
    register<T extends Query>(
        queryType: string,
        handler: QueryHandler<T>
    ): void {
        if (this.handlers.has(queryType)) {
            throw new Error(
                `Handler already registered for query type: ${queryType}`
            );
        }
        this.handlers.set(queryType, handler);
    }

    /**
     * Add middleware to the query processing pipeline
     */
    use(middleware: QueryMiddleware): void {
        this.middlewares.push(middleware);
    }

    /**
     * Execute a query through the middleware pipeline to its handler
     */
    async execute(query: Query): Promise<QueryResult> {
        const handler = this.handlers.get(query.type);
        if (!handler) {
            throw new QueryHandlerNotFoundError(query.type);
        }

        // Create the middleware chain
        const chain = this.createMiddlewareChain(query, handler);
        return await chain();
    }

    private createMiddlewareChain(
        query: Query,
        handler: QueryHandler
    ): () => Promise<QueryResult> {
        let index = 0;

        const chain = async (): Promise<QueryResult> => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                return await middleware.execute(query, chain);
            } else {
                return await handler.handle(query);
            }
        };

        return chain;
    }
}
export interface Query {
    id: string;
    type: string;
    parameters: any;
    metadata: Record<string, any>;
    timestamp: Date;
}

export interface QueryResult {
    data: any;
}

export interface QueryHandler<T extends Query = Query> {
    handle(query: T): Promise<QueryResult> | QueryResult;
}

export interface QueryMiddleware {
    execute(
        query: Query,
        next: () => Promise<QueryResult>
    ): Promise<QueryResult>;
}

export class QueryHandlerNotFoundError extends Error {
    constructor(queryType: string) {
        super(`No handler registered for query type: ${queryType}`);
        this.name = "QueryHandlerNotFoundError";
    }
}

export class QueryValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "QueryValidationError";
    }
}

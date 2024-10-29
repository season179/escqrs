import type { Query, QueryMiddleware } from "../types";

export class ErrorHandlingMiddleware implements QueryMiddleware {
    async execute(query: Query, next: () => Promise<any>): Promise<any> {
        try {
            return await next();
        } catch (error) {
            // Log the error with query context
            console.error("Query execution failed", {
                queryId: query.id,
                queryType: query.type,
                error,
            });
            throw error;
        }
    }
}

import type { Query, QueryMiddleware } from "../types";

export class LoggingMiddleware implements QueryMiddleware {
    async execute(query: Query, next: () => Promise<any>): Promise<any> {
        const startTime = Date.now();

        try {
            const result = await next();

            const duration = Date.now() - startTime;
            console.log("Query executed successfully", {
                queryId: query.id,
                queryType: query.type,
                duration,
            });

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error("Query execution failed", {
                queryId: query.id,
                queryType: query.type,
                duration,
                error,
            });
            throw error;
        }
    }
}

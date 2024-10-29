import type { Query, QueryMiddleware } from "../types";
import { QueryValidationError } from "../types";

export class ValidationMiddleware implements QueryMiddleware {
    async execute(query: Query, next: () => Promise<any>): Promise<any> {
        if (!query.id) {
            throw new QueryValidationError("Query ID is required");
        }
        if (!query.type) {
            throw new QueryValidationError("Query type is required");
        }
        if (!query.timestamp) {
            throw new QueryValidationError("Query timestamp is required");
        }

        return await next();
    }
}

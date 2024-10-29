import { queryHandlers } from "./metadata";
import type { QueryHandler } from "./types";

/**
 * Decorator to mark a class as a QueryHandler.
 * @param queryType - The type of query this handler processes.
 */
export function QueryHandler(queryType: string) {
    return function (constructor: new (...args: any[]) => QueryHandler) {
        // Register the handler in the metadata storage
        queryHandlers.set(queryType, constructor);
    };
}

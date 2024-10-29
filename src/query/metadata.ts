import type { QueryHandler } from "./types";

// Metadata storage for query handlers
export const queryHandlers = new Map<
    string,
    new (...args: any[]) => QueryHandler
>();

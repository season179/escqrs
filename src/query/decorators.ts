import type { Query, QueryHandler } from "./types";

export const queryHandlers = new Map<string, QueryHandler>();

export function QueryHandler(queryType: string) {
    return function (constructor: new (...args: any[]) => any) {
        const instance = new constructor();
        queryHandlers.set(queryType, instance);
    };
}

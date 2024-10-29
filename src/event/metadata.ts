import type { EventHandler } from "./types";

// Metadata storage for event handlers
export const eventHandlers = new Map<
    string,
    Array<new (...args: any[]) => EventHandler>
>();

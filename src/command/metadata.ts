import type { CommandHandler } from "./types";

// Metadata storage for command handlers
export const commandHandlers = new Map<
    string,
    new (...args: any[]) => CommandHandler
>();

import { commandHandlers } from "./metadata";
import type { CommandHandler } from "./types";

/**
 * Decorator to mark a class as a CommandHandler.
 * @param commandType - The type of command this handler processes.
 */
export function CommandHandler(commandType: string) {
    return function (constructor: new (...args: any[]) => CommandHandler) {
        // Register the handler in the metadata storage
        commandHandlers.set(commandType, constructor);
    };
}

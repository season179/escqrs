import type { Command, CommandMiddleware } from "../types";

export class ErrorHandlingMiddleware implements CommandMiddleware {
    async execute(command: Command, next: () => Promise<void>): Promise<void> {
        try {
            await next();
        } catch (error) {
            // Log the error with command context
            console.error("Command execution failed", {
                commandId: command.id,
                commandType: command.type,
                error,
            });
            throw error;
        }
    }
}

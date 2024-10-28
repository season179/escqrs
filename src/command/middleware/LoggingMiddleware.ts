import type { Command, CommandMiddleware } from "../types";

export class LoggingMiddleware implements CommandMiddleware {
    async execute(command: Command, next: () => Promise<void>): Promise<void> {
        const startTime = Date.now();

        try {
            await next();

            const duration = Date.now() - startTime;
            console.log("Command executed successfully", {
                commandId: command.id,
                commandType: command.type,
                duration,
            });
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error("Command execution failed", {
                commandId: command.id,
                commandType: command.type,
                duration,
                error,
            });
            throw error;
        }
    }
}

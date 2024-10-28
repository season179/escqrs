import type { Command, CommandMiddleware } from "../types";
import { CommandValidationError } from "../types";

export class ValidationMiddleware implements CommandMiddleware {
    async execute(command: Command, next: () => Promise<void>): Promise<void> {
        if (!command.id) {
            throw new CommandValidationError("Command ID is required");
        }
        if (!command.type) {
            throw new CommandValidationError("Command type is required");
        }
        if (!command.timestamp) {
            throw new CommandValidationError("Command timestamp is required");
        }

        await next();
    }
}

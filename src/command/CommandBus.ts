// src/command/CommandBus.ts
import { ErrorHandlingMiddleware } from "./middleware/ErrorHandlingMiddleware";
import { ValidationMiddleware } from "./middleware/ValidationMiddleware";
import type { Command, CommandHandler, CommandMiddleware } from "./types";
import { CommandHandlerNotFoundError } from "./types";

export class CommandBus {
    private handlers = new Map<string, CommandHandler>();
    private middlewares: CommandMiddleware[] = [];

    constructor() {
        // Add default error handling middleware
        this.use(new ErrorHandlingMiddleware());
        // Add default validation middleware
        this.use(new ValidationMiddleware());
    }

    /**
     * Register a command handler for a specific command type
     */
    register<T extends Command>(
        commandType: string,
        handler: CommandHandler<T>
    ): void {
        if (this.handlers.has(commandType)) {
            throw new Error(
                `Handler already registered for command type: ${commandType}`
            );
        }
        this.handlers.set(commandType, handler);
    }

    /**
     * Add middleware to the command processing pipeline
     */
    use(middleware: CommandMiddleware): void {
        this.middlewares.push(middleware);
    }

    /**
     * Dispatch a command through the middleware pipeline to its handler
     */
    async dispatch(command: Command): Promise<void> {
        const handler = this.handlers.get(command.type);
        if (!handler) {
            throw new CommandHandlerNotFoundError(command.type);
        }

        // Create the middleware chain
        const chain = this.createMiddlewareChain(command, handler);
        await chain();
    }

    private createMiddlewareChain(
        command: Command,
        handler: CommandHandler
    ): () => Promise<void> {
        let index = 0;

        const chain = async (): Promise<void> => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                await middleware.execute(command, chain);
            } else {
                await handler.handle(command);
            }
        };

        return chain;
    }
}
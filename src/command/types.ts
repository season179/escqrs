export interface Command {
    id: string;
    type: string;
    payload: any;
    metadata: Record<string, any>;
    timestamp: Date;
}

export interface CommandHandler<T extends Command = Command> {
    handle(command: T): Promise<void>;
}

export interface CommandMiddleware {
    execute(command: Command, next: () => Promise<void>): Promise<void>;
}

export class CommandHandlerNotFoundError extends Error {
    constructor(commandType: string) {
        super(`No handler registered for command type: ${commandType}`);
        this.name = "CommandHandlerNotFoundError";
    }
}

export class CommandValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CommandValidationError";
    }
}

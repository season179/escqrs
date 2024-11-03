// src/core/command/CommandBus.ts
import type { Command } from "./Command";
import type { CommandHandler } from "./CommandHandler";
import type { RedisMessageBroker } from "../../infrastructure/RedisMessageBroker";

export class CommandBus {
    private handlers = new Map<string, CommandHandler>();
    private readonly COMMAND_CHANNEL = "commands";

    constructor(private messageBroker: RedisMessageBroker) {
        this.setupCommandSubscription();
    }

    private async setupCommandSubscription(): Promise<void> {
        await this.messageBroker.subscribe(
            this.COMMAND_CHANNEL,
            async (message: unknown) => {
                if (this.isCommand(message)) {
                    const handler = this.handlers.get(message.type);
                    if (handler) {
                        await handler.handle(message);
                    }
                }
            }
        );
    }

    private isCommand(message: unknown): message is Command {
        return (
            typeof message === "object" && message !== null && "type" in message
        );
    }

    register(commandType: string, handler: CommandHandler): void {
        this.handlers.set(commandType, handler);
    }

    async dispatch(command: Command): Promise<void> {
        await this.messageBroker.publish(this.COMMAND_CHANNEL, command);
    }
}

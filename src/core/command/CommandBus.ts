// src/core/command/CommandBus.ts
import { inject, injectable } from "tsyringe";
import type { Command } from "./Command";
import type { CommandHandler } from "./CommandHandler";
import type { RedisMessageBroker } from "../../infrastructure/RedisMessageBroker";

@injectable()
export class CommandBus {
    private handlers = new Map<string, CommandHandler>();
    private readonly COMMAND_CHANNEL = "commands";

    constructor(
        @inject("MessageBroker") private messageBroker: RedisMessageBroker
    ) {
        this.setupCommandSubscription();
    }

    private async setupCommandSubscription(): Promise<void> {
        await this.messageBroker.subscribe(
            this.COMMAND_CHANNEL,
            async (command: Command) => {
                const handler = this.handlers.get(command.type);
                if (handler) {
                    await handler.handle(command);
                }
            }
        );
    }

    register(commandType: string, handler: CommandHandler): void {
        this.handlers.set(commandType, handler);
    }

    async dispatch(command: Command): Promise<void> {
        await this.messageBroker.publish(this.COMMAND_CHANNEL, command);
    }
}

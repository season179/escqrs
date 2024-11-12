// src/core/command/CommandBus.ts
import type { Command } from "./Command";
import type { CommandHandler } from "./CommandHandler";
import type { AzureServiceBusMessageBroker } from "../../infrastructure/AzureServiceBusMessageBroker";

export class CommandBus {
    private handlers = new Map<string, CommandHandler>();
    private readonly COMMAND_CHANNEL = "escqrs-commands";

    constructor(private messageBroker: AzureServiceBusMessageBroker) {
        this.setupCommandSubscription();
    }

    private async setupCommandSubscription(): Promise<void> {
        await this.messageBroker.subscribe(
            this.COMMAND_CHANNEL,
            async (message: unknown) => {
                console.log("Received message:", message);

                if (this.isCommand(message)) {
                    const handler = this.handlers.get(message.type);
                    console.log("Found handler:", !!handler);

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

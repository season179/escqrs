// src/infrastructure/AzureServiceBusMessageBroker.ts
import {
    ServiceBusClient,
    type ServiceBusReceiver,
    type ServiceBusSender,
} from "@azure/service-bus";
import type { Command } from "../core/command/Command";
import type { Event } from "../core/event/Event";
import type { Query } from "../core/query/Query";

type Message = Command | Event | Query | unknown;

export class AzureServiceBusMessageBroker {
    private client: ServiceBusClient;
    private senders: Map<string, ServiceBusSender> = new Map();
    private receivers: Map<string, ServiceBusReceiver> = new Map();
    private handlers: Map<string, Set<(message: Message) => Promise<void>>> =
        new Map();

    constructor(connectionString: string) {
        this.client = new ServiceBusClient(connectionString);
    }

    async publish(queue: string, message: Message): Promise<void> {
        let sender = this.senders.get(queue);
        if (!sender) {
            sender = this.client.createSender(queue);
            this.senders.set(queue, sender);
        }

        await sender.sendMessages({
            body: message,
            contentType: "application/json",
        });
    }

    async subscribe(
        queue: string,
        handler: (message: Message) => Promise<void>
    ): Promise<void> {
        if (!this.handlers.has(queue)) {
            this.handlers.set(queue, new Set());
            const receiver = this.client.createReceiver(queue);
            this.receivers.set(queue, receiver);

            receiver.subscribe({
                processMessage: async (message) => {
                    // processMessage handles business logic errors (e.g. validation failures, 
                    // invalid message format, etc). These are caught and result in the message
                    // being dead-lettered for later analysis and retry.
                    const handlers = this.handlers.get(queue);
                    if (handlers) {
                        try {
                            await handler(message.body as Message);
                            await receiver.completeMessage(message);
                        } catch (error) {
                            console.error("Error processing message:", error);
                            await receiver.deadLetterMessage(message, {
                                deadLetterReason: "Processing failed",
                                deadLetterErrorDescription:
                                    error instanceof Error
                                        ? error.message
                                        : "Unknown error",
                            });
                        }
                    }
                },
                processError: async (err) => {
                    // processError handles infrastructure errors (e.g. network issues,
                    // connection problems, etc). These require infrastructure-level
                    // resolution rather than message-specific handling.
                    console.error("Service Bus receiver error:", err);
                },
            });
        }
        this.handlers.get(queue)?.add(handler);
    }

    async close(): Promise<void> {
        await Promise.all([...this.senders.values()].map((s) => s.close()));
        await Promise.all([...this.receivers.values()].map((r) => r.close()));
        await this.client.close();
    }
}

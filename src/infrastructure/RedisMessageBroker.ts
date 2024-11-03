// src/infrastructure/RedisMessageBroker.ts
import { injectable } from "tsyringe";
import { Redis } from "ioredis";
import type { Command } from "../core/command/Command";
import type { Event } from "../core/event/Event";

@injectable()
export class RedisMessageBroker {
    private publisher: Redis;
    private subscriber: Redis;
    private handlers: Map<string, Set<(message: any) => Promise<void>>> =
        new Map();

    constructor() {
        const redisConfig = {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times: number) => Math.min(times * 50, 2000),
        };

        this.publisher = new Redis(redisConfig);
        this.subscriber = new Redis(redisConfig);

        this.subscriber.on("message", (channel: string, message: string) => {
            this.handleMessage(channel, message);
        });
    }

    async publish(channel: string, message: Command | Event): Promise<void> {
        await this.publisher.publish(channel, JSON.stringify(message));
    }

    async subscribe(
        channel: string,
        handler: (message: any) => Promise<void>
    ): Promise<void> {
        if (!this.handlers.has(channel)) {
            this.handlers.set(channel, new Set());
            await this.subscriber.subscribe(channel);
        }
        this.handlers.get(channel)?.add(handler);
    }

    private async handleMessage(
        channel: string,
        message: string
    ): Promise<void> {
        const handlers = this.handlers.get(channel);
        if (handlers) {
            const parsedMessage = JSON.parse(message);
            const promises = Array.from(handlers).map((handler) =>
                handler(parsedMessage)
            );
            await Promise.all(promises);
        }
    }

    async close(): Promise<void> {
        await this.publisher.quit();
        await this.subscriber.quit();
    }
}

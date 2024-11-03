// src/infrastructure/RedisMessageBroker.ts
import { injectable } from "tsyringe";
import { Redis } from "ioredis";
import { env } from "../config/env.config";
import type { Command } from "../core/command/Command";
import type { Event } from "../core/event/Event";
import type { Query } from "../core/query/Query";

type Message = Command | Event | Query | unknown;

@injectable()
export class RedisMessageBroker {
    private publisher: Redis;
    private subscriber: Redis;
    private handlers: Map<string, Set<(message: Message) => Promise<void>>> =
        new Map();

    constructor() {
        const redisConfig = {
            host: env.REDIS_HOST,
            port: parseInt(env.REDIS_PORT),
            password: env.REDIS_PASSWORD,
            retryStrategy: (times: number) => Math.min(times * 50, 2000),
        };

        this.publisher = new Redis(redisConfig);
        this.subscriber = new Redis(redisConfig);

        this.subscriber.on("message", (channel: string, message: string) => {
            this.handleMessage(channel, message);
        });
    }

    async publish(channel: string, message: Message): Promise<void> {
        await this.publisher.publish(channel, JSON.stringify(message));
    }

    async subscribe(
        channel: string,
        handler: (message: Message) => Promise<void>
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
            const parsedMessage = JSON.parse(message) as Message;
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

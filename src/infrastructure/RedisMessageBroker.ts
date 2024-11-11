// src/infrastructure/RedisMessageBroker.ts

import { Redis } from "ioredis";
import { env } from "../config/env.config";
import type { Command } from "../core/command/Command";
import type { Event } from "../core/event/Event";
import type { Query } from "../core/query/Query";

type Message = Command | Event | Query | unknown;

export class RedisMessageBroker {
    private publisher: Redis;
    private subscriber: Redis;
    private handlers: Map<string, Set<(message: Message) => Promise<void>>> =
        new Map();
    private maxRetryAttempts = 5;

    constructor() {
        let retryCount = 0;
        const redisConfig = {
            host: env.REDIS_HOST,
            port: parseInt(env.REDIS_PORT),
            password: env.REDIS_PASSWORD,
            retryStrategy: (times: number) => {
                retryCount += 1;
                if (retryCount > this.maxRetryAttempts) {
                    console.error(
                        "Redis connection failed after multiple attempts."
                    );
                    process.exit(1);
                }
                return Math.min(times * 50, 2000);
            },
        };

        this.publisher = new Redis(redisConfig);
        this.subscriber = new Redis(redisConfig);

        this.publisher.on("error", (error) => {
            console.error("Redis Publisher Error:", (error as Error).message);
        });

        this.subscriber.on("error", (error) => {
            console.error("Redis Subscriber Error:", (error as Error).message);
        });

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
        console.log('Subscribing to channel:', channel);
        if (!this.handlers.has(channel)) {
            this.handlers.set(channel, new Set());
            await this.subscriber.subscribe(channel);
            console.log('Subscribed to Redis channel:', channel);
        }
        this.handlers.get(channel)?.add(handler);
    }

    private async handleMessage(
        channel: string,
        message: string
    ): Promise<void> {
        console.log("Redis received message on channel:", channel);
        const handlers = this.handlers.get(channel);
        console.log("Found handlers:", !!handlers);
        if (handlers) {
            const parsedMessage = JSON.parse(message) as Message;
            const promises = Array.from(handlers).map((handler) =>
                handler(parsedMessage)
            );
            await Promise.all(promises);
        }
    }

    async checkReady(): Promise<void> {
        try {
            await this.publisher.ping();
        } catch (error) {
            console.error(
                "Failed to connect to Redis during readiness check:",
                (error as Error).message
            );
            process.exit(1);
        }
    }

    async close(): Promise<void> {
        await this.publisher.quit();
        await this.subscriber.quit();
    }
}

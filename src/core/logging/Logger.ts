// src/core/logging/Logger.ts
import pino from "pino";

export class Logger {
    private logger: pino.Logger;

    constructor() {
        this.logger = pino({
            level: process.env.NODE_ENV === "production" ? "info" : "debug",
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                },
            },
        });
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.logger.info(context, message);
    }

    error(
        message: string,
        error?: Error,
        context?: Record<string, unknown>
    ): void {
        this.logger.error({ ...context, error: error?.stack }, message);
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.logger.debug(context, message);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.logger.warn(context, message);
    }
}

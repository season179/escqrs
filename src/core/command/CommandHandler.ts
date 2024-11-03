// src/core/command/CommandHandler.ts
import type { Command } from "./Command";

export interface CommandHandler {
    handle(command: Command): Promise<void>;
}

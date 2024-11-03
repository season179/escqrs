// src/core/command/Command.ts
export interface Command {
    type: string;
    payload: unknown;
    metadata?: Record<string, unknown>;
}

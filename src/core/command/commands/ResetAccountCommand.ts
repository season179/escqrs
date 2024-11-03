// src/core/command/commands/ResetAccountCommand.ts
import type { Command } from "../Command";

export interface ResetAccountCommand extends Command {
    type: "RESET_ACCOUNT";
    payload: {
        ebid: string;
    };
}

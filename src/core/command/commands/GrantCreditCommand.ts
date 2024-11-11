// src/core/command/commands/GrantCreditCommand.ts
import type { Command } from "../Command";

export interface GrantCreditCommand extends Command {
    type: "GRANT_CREDIT";
    payload: {
        uid: string;
        ebid?: string;
        amount: number;
    };
}

// src/core/command/commands/ProcessReversalCommand.ts
import type { Command } from "../Command";

export interface ProcessReversalCommand extends Command {
    type: "PROCESS_REVERSAL";
    payload: {
        ebid: string;
        transactionId: string;
        amount: number;
    };
}

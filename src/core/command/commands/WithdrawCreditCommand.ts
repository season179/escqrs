// src/core/command/commands/WithdrawCreditCommand.ts
import type { Command } from "../Command";

export interface WithdrawCreditCommand extends Command {
    type: "WITHDRAW_CREDIT";
    payload: {
        uid: string;
        amount: number;
    };
}

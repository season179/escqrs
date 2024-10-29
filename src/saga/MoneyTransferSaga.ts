import { Saga } from "./Saga";
import type { Event } from "../event/types";
import { CommandGateway } from "../command/CommandGateway";

interface MoneyTransferData {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
}

export class MoneyTransferSaga extends Saga {
    private commandGateway: CommandGateway;

    constructor(
        data: MoneyTransferData,
        commandGateway: CommandGateway, // Accept CommandGateway as a parameter
        id?: string
      ) {
        super(data, id);
        this.commandGateway = commandGateway;
      }

    async start(): Promise<void> {
        // Step 1: Initiate withdrawal from source account
        await this.commandGateway.send("WithdrawMoney", {
            accountId: this.data.sourceAccountId,
            amount: this.data.amount,
            sagaId: this.id,
        });
        this.state = "AwaitingWithdrawal";
    }

    async handleEvent(event: Event): Promise<void> {
        if (event.metadata.sagaId !== this.id) {
            // Ignore events not related to this saga
            return;
        }

        if (
            this.state === "AwaitingWithdrawal" &&
            event.type === "MoneyWithdrawn"
        ) {
            // Step 2: Deposit to destination account
            await this.commandGateway.send("DepositMoney", {
                accountId: this.data.destinationAccountId,
                amount: this.data.amount,
                sagaId: this.id,
            });
            this.state = "AwaitingDeposit";
        } else if (
            this.state === "AwaitingDeposit" &&
            event.type === "MoneyDeposited"
        ) {
            // Saga completed successfully
            this.state = "Completed";
        } else if (event.type === "WithdrawalFailed") {
            // Handle withdrawal failure, possibly compensate
            this.state = "Failed";
        } else if (event.type === "DepositFailed") {
            // Handle deposit failure, possibly compensate
            // Optionally, refund the amount to the source account
            this.state = "Failed";
        }
    }

    isCompleted(): boolean {
        return this.state === "Completed" || this.state === "Failed";
    }
}

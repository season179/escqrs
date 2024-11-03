// src/core/saga/MonthlyResetSaga.ts
import type { CommandBus } from "../command/CommandBus";
import type { EventBus } from "../event/EventBus";
import type { Event } from "../event/Event";
import type { EventHandler } from "../event/EventHandler";
import type { Database } from "../../infrastructure/Database";
import type { SagaManager } from "./SagaManager";
import { SagaStatus } from "./Saga";

export class MonthlyResetSaga {
    constructor(
        private commandBus: CommandBus,
        private eventBus: EventBus,
        private sagaManager: SagaManager,
        private db: Database
    ) {
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        const handler: EventHandler = {
            handle: async (event: Event) => {
                if (
                    typeof event.payload === "object" &&
                    event.payload !== null
                ) {
                    const sagaId = await this.sagaManager.create(
                        "MONTHLY_RESET",
                        event.payload
                    );
                    await this.processMonthlyReset(
                        sagaId,
                        event.payload as Record<string, unknown>
                    );
                }
            },
        };

        this.eventBus.subscribe("MONTHLY_RESET_TRIGGERED", handler);
    }

    private async processMonthlyReset(
        sagaId: string,
        data: Record<string, unknown>
    ): Promise<void> {
        try {
            const accounts = await this.getActiveAccounts();

            for (const account of accounts) {
                await this.commandBus.dispatch({
                    type: "RESET_ACCOUNT",
                    payload: {
                        ebid: account.ebid,
                    },
                });
            }

            await this.sagaManager.update(sagaId, SagaStatus.COMPLETED, data);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            await this.sagaManager.update(sagaId, SagaStatus.FAILED, {
                ...data,
                error: errorMessage,
            });
        }
    }

    private async getActiveAccounts(): Promise<Array<{ ebid: string }>> {
        const result = await this.db.query(
            "SELECT DISTINCT ebid FROM account_balances WHERE current_balance > 0"
        );
        return result.rows;
    }
}

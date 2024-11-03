// src/core/saga/ReversalSaga.ts
import { inject, injectable } from "tsyringe";
import type { CommandBus } from "../command/CommandBus";
import type { EventBus } from "../event/EventBus";
import type { Event } from "../event/Event";
import type { EventHandler } from "../event/EventHandler";
import type { SagaManager } from "./SagaManager";
import { SagaStatus } from "./Saga";

@injectable()
export class ReversalSaga {
    constructor(
        @inject("CommandBus") private commandBus: CommandBus,
        @inject("EventBus") private eventBus: EventBus,
        @inject("SagaManager") private sagaManager: SagaManager
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
                        "REVERSAL",
                        event.payload
                    );
                    await this.processReversal(
                        sagaId,
                        event.payload as Record<string, unknown>
                    );
                }
            },
        };

        this.eventBus.subscribe("REVERSAL_REQUESTED", handler);
    }

    private async processReversal(
        sagaId: string,
        data: Record<string, unknown>
    ): Promise<void> {
        try {
            await this.commandBus.dispatch({
                type: "PROCESS_REVERSAL",
                payload: data,
            });

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
}

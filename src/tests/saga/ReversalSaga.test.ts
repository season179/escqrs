// src/tests/saga/ReversalSaga.test.ts
import { describe, it, expect, mock } from "bun:test";
import { ReversalSaga } from "../../core/saga/ReversalSaga";
import { CommandBus } from "../../core/command/CommandBus";
import { EventBus } from "../../core/event/EventBus";
import { SagaManager } from "../../core/saga/SagaManager";
import { SagaStatus } from "../../core/saga/Saga";
import type { EventHandler } from "../../core/event/EventHandler";

describe("ReversalSaga", () => {
    const mockCommandBus = {
        dispatch: mock(() => Promise.resolve()),
    } as unknown as CommandBus;

    let subscribedHandler: EventHandler;
    const mockEventBus = {
        subscribe: mock((type: string, handler: EventHandler) => {
            subscribedHandler = handler;
        }),
    } as unknown as EventBus;

    const mockSagaManager = {
        create: mock(() => Promise.resolve("saga123")),
        update: mock(() => Promise.resolve()),
    } as unknown as SagaManager;

    const saga = new ReversalSaga(
        mockCommandBus,
        mockEventBus,
        mockSagaManager
    );

    it("should process reversal successfully", async () => {
        const event = {
            type: "REVERSAL_REQUESTED",
            payload: {
                uid: "emp123",
                transactionId: "tx123",
                amount: 100,
            },
            id: "event123",
            aggregateId: "agg123",
            uid: "emp123",
            version: 1,
            timestamp: new Date(),
        };

        // Simulate event handling
        await subscribedHandler.handle(event);

        expect(mockSagaManager.create).toHaveBeenCalled();
        expect(mockCommandBus.dispatch).toHaveBeenCalled();
        expect(mockSagaManager.update).toHaveBeenCalledWith(
            "saga123",
            SagaStatus.COMPLETED,
            expect.any(Object)
        );
    });
});

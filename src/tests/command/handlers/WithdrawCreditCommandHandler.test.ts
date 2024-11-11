// src/tests/command/handlers/WithdrawCreditCommandHandler.test.ts
import { describe, it, expect, mock, spyOn } from "bun:test";
import { WithdrawCreditCommandHandler } from "../../../core/command/handlers/WithdrawCreditCommandHandler";
import type { WithdrawCreditCommand } from "../../../core/command/commands/WithdrawCreditCommand";
import { EventStore } from "../../../core/event/EventStore";
import { EventBus } from "../../../core/event/EventBus";
import { DomainError } from "../../../core/errors/DomainError";

describe("WithdrawCreditCommandHandler", () => {
    const mockEventStore = {
        save: mock(() => Promise.resolve()),
        getEvents: mock(() =>
            Promise.resolve([
                {
                    type: "CREDIT_GRANTED",
                    payload: { amount: 100 },
                    version: 1,
                },
            ])
        ),
    } as unknown as EventStore;

    const mockEventBus = {
        publish: mock(() => Promise.resolve()),
    } as unknown as EventBus;

    const handler = new WithdrawCreditCommandHandler(
        mockEventStore,
        mockEventBus
    );

    it("should successfully withdraw credit", async () => {
        const command: WithdrawCreditCommand = {
            type: "WITHDRAW_CREDIT",
            payload: {
                uid: "emp123",
                amount: 50,
            },
        };

        await handler.handle(command);

        expect(mockEventStore.save).toHaveBeenCalled();
        expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it("should throw error for insufficient balance", async () => {
        const command: WithdrawCreditCommand = {
            type: "WITHDRAW_CREDIT",
            payload: {
                uid: "emp123",
                amount: 150,
            },
        };

        await expect(handler.handle(command)).rejects.toThrow(DomainError);
    });
});

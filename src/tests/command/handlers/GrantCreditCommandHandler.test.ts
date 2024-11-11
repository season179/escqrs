// src/tests/command/handlers/GrantCreditCommandHandler.test.ts
import { describe, it, expect, mock, spyOn } from "bun:test";
import { GrantCreditCommandHandler } from "../../../core/command/handlers/GrantCreditCommandHandler";
import type { GrantCreditCommand } from "../../../core/command/commands/GrantCreditCommand";
import { EventStore } from "../../../core/event/EventStore";
import { EventBus } from "../../../core/event/EventBus";
import { DomainError } from "../../../core/errors/DomainError";

describe("GrantCreditCommandHandler", () => {
    const mockEventStore = {
        save: mock(() => Promise.resolve()),
        getEvents: mock(() => Promise.resolve([])),
    } as unknown as EventStore;

    const mockEventBus = {
        publish: mock(() => Promise.resolve()),
    } as unknown as EventBus;

    const handler = new GrantCreditCommandHandler(mockEventStore, mockEventBus);

    it("should successfully grant credit", async () => {
        const command: GrantCreditCommand = {
            type: "GRANT_CREDIT",
            payload: {
                uid: "emp123",
                amount: 100,
            },
        };

        await handler.handle(command);

        expect(mockEventStore.save).toHaveBeenCalled();
        expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it("should throw error for negative amount", async () => {
        const command: GrantCreditCommand = {
            type: "GRANT_CREDIT",
            payload: {
                uid: "emp123",
                amount: -100,
            },
        };

        await expect(handler.handle(command)).rejects.toThrow(DomainError);
    });
});

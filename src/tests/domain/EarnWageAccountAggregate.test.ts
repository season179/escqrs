// src/tests/domain/EarnWageAccountAggregate.test.ts
import { describe, it, expect } from "bun:test";
import { EarnWageAccountAggregate } from "../../core/domain/EarnWageAccountAggregate";
import { DomainError } from "../../core/errors/DomainError";

describe("EarnWageAccountAggregate", () => {
    it("should create a new account with zero balance", () => {
        const account = new EarnWageAccountAggregate("emp123");
        expect(account.getBalance()).toBe(0);
    });

    it("should grant credit and emit event", () => {
        const account = new EarnWageAccountAggregate("emp123");
        const event = account.grantCredit(100);

        expect(event.type).toBe("CREDIT_GRANTED");
        expect(event.payload).toEqual({ amount: 100 });

        account.applyEvent(event);
        expect(account.getBalance()).toBe(100);
    });

    it("should withdraw credit and emit event", () => {
        const account = new EarnWageAccountAggregate("emp123");
        const creditEvent = account.grantCredit(100);
        account.applyEvent(creditEvent);

        const withdrawEvent = account.withdrawCredit(50);
        expect(withdrawEvent.type).toBe("CREDIT_WITHDRAWN");
        expect(withdrawEvent.payload).toEqual({ amount: 50 });

        account.applyEvent(withdrawEvent);
        expect(account.getBalance()).toBe(50);
    });

    it("should throw error when withdrawing more than balance", () => {
        const account = new EarnWageAccountAggregate("emp123");
        const creditEvent = account.grantCredit(100);
        account.applyEvent(creditEvent);

        expect(() => account.withdrawCredit(150)).toThrow(DomainError);
    });
});

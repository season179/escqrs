// src/tests/integration/MonthlyReset.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { ServiceContainer } from "../../core/container/ServiceContainer";
import { Database } from "../../infrastructure/Database";
import { CommandBus } from "../../core/command/CommandBus";
import { EventBus } from "../../core/event/EventBus";
import { QueryBus } from "../../core/query/QueryBus";
import type { GrantCreditCommand } from "../../core/command/commands/GrantCreditCommand";
import type { GetAccountBalanceQuery } from "../../core/query/queries/GetAccountBalanceQuery";
import { nanoid } from "nanoid";

describe("Monthly Reset Integration", () => {
    let database: Database;
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let queryBus: QueryBus;

    beforeAll(async () => {
        const container = ServiceContainer.getInstance();
        database = container.resolve<Database>("Database");
        commandBus = container.resolve<CommandBus>("CommandBus");
        eventBus = container.resolve<EventBus>("EventBus");
        queryBus = container.resolve<QueryBus>("QueryBus");
    });

    afterAll(async () => {
        await database.query(
            "TRUNCATE TABLE events, account_balances, sagas CASCADE"
        );
    });

    it("should reset all accounts at month end", async () => {
        const ebid = "emp123";

        // Setup initial balance
        const grantCommand: GrantCreditCommand = {
            type: "GRANT_CREDIT",
            payload: {
                ebid,
                amount: 1000,
            },
        };
        await commandBus.dispatch(grantCommand);

        // Trigger monthly reset
        await eventBus.publish({
            id: nanoid(),
            type: "MONTHLY_RESET_TRIGGERED",
            aggregateId: "system",
            ebid: "system",
            version: 1,
            timestamp: new Date(),
            payload: { triggeredAt: new Date() },
        });

        // Wait for reset to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check final balance
        const balanceQuery: GetAccountBalanceQuery = {
            type: "GET_ACCOUNT_BALANCE",
            payload: { ebid },
        };
        const balance = await queryBus.execute<{ balance: number }>(
            balanceQuery
        );
        expect(balance.balance).toBe(0);
    });
});

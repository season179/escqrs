// src/tests/integration/AccountOperations.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { ServiceContainer } from "../../core/container/ServiceContainer";
import { Database } from "../../infrastructure/Database";
import { CommandBus } from "../../core/command/CommandBus";
import { QueryBus } from "../../core/query/QueryBus";
import type { GrantCreditCommand } from "../../core/command/commands/GrantCreditCommand";
import type { WithdrawCreditCommand } from "../../core/command/commands/WithdrawCreditCommand";
import type { GetAccountBalanceQuery } from "../../core/query/queries/GetAccountBalanceQuery";

describe("Account Operations Integration", () => {
    let database: Database;
    let commandBus: CommandBus;
    let queryBus: QueryBus;

    beforeAll(async () => {
        const container = ServiceContainer.getInstance();
        database = container.resolve<Database>("Database");
        commandBus = container.resolve<CommandBus>("CommandBus");
        queryBus = container.resolve<QueryBus>("QueryBus");
    });

    afterAll(async () => {
        await database.query("TRUNCATE TABLE events, account_balances CASCADE");
    });

    it("should handle full account operation cycle", async () => {
        const ebid = "emp123";

        // Grant credit
        const grantCommand: GrantCreditCommand = {
            type: "GRANT_CREDIT",
            payload: {
                ebid,
                amount: 1000,
            },
        };
        await commandBus.dispatch(grantCommand);

        // Check balance
        const balanceQuery: GetAccountBalanceQuery = {
            type: "GET_ACCOUNT_BALANCE",
            payload: { ebid },
        };
        let balance = await queryBus.execute<{ balance: number }>(balanceQuery);
        expect(balance.balance).toBe(1000);

        // Withdraw credit
        const withdrawCommand: WithdrawCreditCommand = {
            type: "WITHDRAW_CREDIT",
            payload: {
                ebid,
                amount: 300,
            },
        };
        await commandBus.dispatch(withdrawCommand);

        // Check final balance
        balance = await queryBus.execute<{ balance: number }>(balanceQuery);
        expect(balance.balance).toBe(700);
    });
});

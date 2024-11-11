// src/tests/query/handlers/GetAccountBalanceQueryHandler.test.ts
import { describe, it, expect, mock } from "bun:test";
import { GetAccountBalanceQueryHandler } from "../../../core/query/handlers/GetAccountBalanceQueryHandler";
import type { GetAccountBalanceQuery } from "../../../core/query/queries/GetAccountBalanceQuery";
import { Database } from "../../../infrastructure/Database";

describe("GetAccountBalanceQueryHandler", () => {
    let mockQueryResult = {
        rows: [{ current_balance: 100 }],
    };

    const mockDatabase = {
        query: mock(() => Promise.resolve(mockQueryResult)),
    } as unknown as Database;

    const handler = new GetAccountBalanceQueryHandler(mockDatabase);

    it("should return account balance", async () => {
        const query: GetAccountBalanceQuery = {
            type: "GET_ACCOUNT_BALANCE",
            payload: {
                uid: "emp123",
            },
        };

        const result = await handler.handle(query);
        expect(result).toEqual({ balance: 100 });
    });

    it("should return zero balance for non-existent account", async () => {
        // Reset mock result for this test
        mockQueryResult = { rows: [] };

        const query: GetAccountBalanceQuery = {
            type: "GET_ACCOUNT_BALANCE",
            payload: {
                uid: "emp456",
            },
        };

        const result = await handler.handle(query);
        expect(result).toEqual({ balance: 0 });
    });
});

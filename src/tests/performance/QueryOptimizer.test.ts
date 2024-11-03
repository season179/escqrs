// src/tests/performance/QueryOptimizer.test.ts
import { describe, it, expect, mock } from "bun:test";
import { QueryOptimizer } from "../../core/performance/QueryOptimizer";
import { Database } from "../../infrastructure/Database";

describe("QueryOptimizer", () => {
    const mockDatabase = {
        query: mock(() => Promise.resolve({ rows: [{ balance: 100 }] })),
    } as unknown as Database;

    const optimizer = new QueryOptimizer(mockDatabase);

    it("should cache query results", async () => {
        const key = "test-query";
        const query = "SELECT * FROM test";

        // First call
        const result1 = await optimizer.optimizeQuery(key, query, []);
        expect(mockDatabase.query).toHaveBeenCalledTimes(1);

        // Second call (should use cache)
        const result2 = await optimizer.optimizeQuery(key, query, []);
        expect(mockDatabase.query).toHaveBeenCalledTimes(1);
        expect(result1).toEqual(result2);
    });

    it("should invalidate cache", async () => {
        const key = "test-query";
        const query = "SELECT * FROM test";

        await optimizer.optimizeQuery(key, query, []);
        optimizer.invalidateCache(key);

        await optimizer.optimizeQuery(key, query, []);
        expect(mockDatabase.query).toHaveBeenCalledTimes(2);
    });
});

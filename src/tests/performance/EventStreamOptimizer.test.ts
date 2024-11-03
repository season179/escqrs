// src/tests/performance/EventStreamOptimizer.test.ts
import { describe, it, expect, mock } from "bun:test";
import { EventStreamOptimizer } from "../../core/performance/EventStreamOptimizer";
import { Database } from "../../infrastructure/Database";

describe("EventStreamOptimizer", () => {
    const mockDatabase = {
        query: mock(() =>
            Promise.resolve({ rows: [{ state: { balance: 100 }, version: 5 }] })
        ),
    } as unknown as Database;

    const optimizer = new EventStreamOptimizer(mockDatabase);

    it("should create snapshot", async () => {
        await optimizer.createSnapshot("agg123", { balance: 100 }, 5);
        expect(mockDatabase.query).toHaveBeenCalled();
    });

    it("should retrieve latest snapshot", async () => {
        const snapshot = await optimizer.getLatestSnapshot("agg123");
        expect(snapshot).toEqual({
            state: { balance: 100 },
            version: 5,
        });
    });

    it("should prune old events", async () => {
        await optimizer.pruneEvents("agg123", 5);
        expect(mockDatabase.query).toHaveBeenCalled();
    });
});

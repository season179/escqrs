// src/core/performance/QueryOptimizer.ts
import type { Database } from "../../infrastructure/Database";

export class QueryOptimizer {
    private readonly CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    private cache = new Map<string, { data: unknown; timestamp: number }>();

    constructor(private db: Database) {}

    async optimizeQuery<T>(
        key: string,
        query: string,
        params: unknown[]
    ): Promise<T> {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
            return cached.data as T;
        }

        const result = await this.db.query(query, params);
        this.cache.set(key, {
            data: result,
            timestamp: Date.now(),
        });

        return result as T;
    }

    invalidateCache(key: string): void {
        this.cache.delete(key);
    }

    clearCache(): void {
        this.cache.clear();
    }
}

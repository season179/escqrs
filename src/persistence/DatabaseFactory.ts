import type { DatabaseAdapter, DatabaseConfig } from "./types";
import { SQLiteAdapter } from "./SQLiteAdapter";
import { PostgreSQLAdapter } from "./PostgreSQLAdapter";

export type DatabaseType = "sqlite" | "postgresql";

export class DatabaseFactory {
    static createAdapter(
        type: DatabaseType,
        config: DatabaseConfig
    ): DatabaseAdapter {
        switch (type) {
            case "sqlite":
                return new SQLiteAdapter(config);
            case "postgresql":
                return new PostgreSQLAdapter(config);
            default:
                throw new Error(`Unsupported database type: ${type}`);
        }
    }
}

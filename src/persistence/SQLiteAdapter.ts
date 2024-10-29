import { Database } from "bun:sqlite";
import { BaseAdapter } from "./BaseAdapter";
import type { DatabaseConfig, QueryResult, Transaction } from "./types";

class SQLiteTransaction implements Transaction {
    constructor(private db: Database) {}

    async execute(query: string, params?: any[]): Promise<QueryResult> {
        try {
            const stmt = this.db.prepare(query);
            console.log("SQLiteTransaction.execute", query, params);
            // Using .run() for mutations and .all() for queries
            // Ensure params are primitive values that SQLite can handle
            const sanitizedParams = params?.map((param) => {
                if (param === undefined) return null;
                if (typeof param === "object" && param !== null) {
                    return JSON.stringify(param);
                }
                return param;
            });

            const result = params
                ? query.trim().toUpperCase().startsWith("SELECT")
                    ? stmt.all(...sanitizedParams ?? [])
                    : stmt.run(...sanitizedParams ?? [])
                : stmt.all();

            return {
                rows: Array.isArray(result) ? result : [result],
                rowCount: Array.isArray(result) ? result.length : 1,
            };
        } catch (error) {
            throw error; // Remove rollback here as it's handled by the transaction wrapper
        }
    }

    async commit(): Promise<void> {
        this.db.exec("COMMIT");
    }

    async rollback(): Promise<void> {
        this.db.exec("ROLLBACK");
    }
}

export class SQLiteAdapter extends BaseAdapter {
    private db: Database | null = null;

    constructor(config: DatabaseConfig) {
        super(config);
    }

    async connect(): Promise<void> {
        try {
            if (!this.config.filename) {
                throw new Error("SQLite filename is required");
            }
            this.db = new Database(this.config.filename);
        } catch (error) {
            throw this.formatError(error);
        }
    }

    async disconnect(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    async execute(query: string, params?: any[]): Promise<QueryResult> {
        if (!this.db) {
            throw new Error("Database not connected");
        }

        try {
            const stmt = this.db.prepare(query);
            // Using .run() for mutations and .all() for queries
            const result = params
                ? query.trim().toUpperCase().startsWith("SELECT")
                    ? stmt.all(...params)
                    : stmt.run(...params)
                : stmt.all();

            return {
                rows: Array.isArray(result) ? result : [result],
                rowCount: Array.isArray(result) ? result.length : 1,
            };
        } catch (error) {
            throw this.formatError(error);
        }
    }

    async commit(): Promise<void> {
        if (!this.db) {
            throw new Error("Database not connected");
        }

        this.db.exec("COMMIT");
    }

    async rollback(): Promise<void> {
        if (!this.db) {
            throw new Error("Database not connected");
        }

        this.db.exec("ROLLBACK");
    }

    async transaction<T>(
        fn: (transaction: Transaction) => Promise<T>
    ): Promise<T> {
        if (!this.db) {
            throw new Error("Database not connected");
        }

        try {
            this.db.exec("BEGIN TRANSACTION"); // Changed to match working example
            const transaction = new SQLiteTransaction(this.db);
            const result = await fn(transaction);
            this.db.exec("COMMIT");
            return result;
        } catch (error) {
            try {
                this.db.exec("ROLLBACK");
            } catch (rollbackError) {
                // Only throw if it's not already rolled back
                // if (!rollbackError.message.includes("no transaction is active")) {
                //     throw this.formatError(rollbackError);
                // }
                throw this.formatError(rollbackError);
            }
            throw this.formatError(error);
        }
    }
}

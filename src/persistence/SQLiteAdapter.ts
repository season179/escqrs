import { Database } from "bun:sqlite";
import { BaseAdapter } from "./BaseAdapter";
import type { DatabaseConfig, QueryResult, Transaction } from "./types";

class SQLiteTransaction implements Transaction {
    constructor(private db: Database) {}

    async execute(query: string, params?: any[]): Promise<QueryResult> {
        try {
            const stmt = this.db.prepare(query);
            const result = params ? stmt.all(...params) : stmt.all();
            return {
                rows: result,
                rowCount: result.length,
            };
        } catch (error) {
            await this.rollback();
            throw error;
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
            const result = params ? stmt.all(...params) : stmt.all();
            return {
                rows: result,
                rowCount: result.length,
            };
        } catch (error) {
            throw this.formatError(error);
        }
    }

    async transaction<T>(
        fn: (transaction: Transaction) => Promise<T>
    ): Promise<T> {
        if (!this.db) {
            throw new Error("Database not connected");
        }

        try {
            this.db.exec("BEGIN TRANSACTION");
            const transaction = new SQLiteTransaction(this.db);
            const result = await fn(transaction);
            await transaction.commit();
            return result;
        } catch (error) {
            this.db.exec("ROLLBACK");
            throw this.formatError(error);
        }
    }
}

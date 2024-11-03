// src/infrastructure/Database.ts
import { injectable } from "tsyringe";
import { Pool } from "pg";
import type { QueryResult } from "pg";
import { env } from "../config/env.config";

@injectable()
export class Database {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: env.POSTGRES_HOST,
            port: parseInt(env.POSTGRES_PORT),
            database: env.POSTGRES_DB,
            user: env.POSTGRES_USER,
            password: env.POSTGRES_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        event_id TEXT PRIMARY KEY,
        aggregate_id TEXT NOT NULL,
        ebid TEXT NOT NULL,
        event_type TEXT NOT NULL,
        version INTEGER NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        payload JSONB NOT NULL,
        metadata JSONB
      );
      
      CREATE INDEX IF NOT EXISTS idx_events_aggregate_id ON events(aggregate_id);
      CREATE INDEX IF NOT EXISTS idx_events_ebid ON events(ebid);
    `);
    }

    async query(sql: string, params: any[] = []): Promise<QueryResult> {
        const client = await this.pool.connect();
        try {
            return await client.query(sql, params);
        } finally {
            client.release();
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}

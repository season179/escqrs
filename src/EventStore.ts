// src/escqrs/EventStore.ts

import { Pool } from "pg";
import { CreditGrantedEvent } from "./CreditGrantedEvent";
import { config } from "dotenv";

config();

const pool = new Pool({
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB || "earnwage",
    password: process.env.POSTGRES_PASSWORD || "your_secure_password_here",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

export class EventStore {
    static async ensureTableExists(): Promise<void> {
        // First ensure database exists
        const client = await pool.connect();
        try {
            // Check if database exists
            const dbCheckQuery = `
                SELECT FROM pg_database WHERE datname = 'earnwage'
            `;
            const dbResult = await client.query(dbCheckQuery);

            if (dbResult.rowCount === 0) {
                // Create database if it doesn't exist
                await client.query("CREATE DATABASE earnwage");
            }
        } finally {
            client.release();
        }

        // Create events table
        const query = `
            CREATE TABLE IF NOT EXISTS events (
                event_id VARCHAR(255) PRIMARY KEY,
                uid VARCHAR(255) NOT NULL,
                type VARCHAR(255) NOT NULL,
                version INTEGER NOT NULL,
                payload JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(uid, version)
            )
        `;
        await pool.query(query);
    }

    static async save(event: CreditGrantedEvent): Promise<void> {
        await this.ensureTableExists();

        const query =
            "INSERT INTO events (uid, type, payload) VALUES ($1, $2, $3)";
        // Create a new object without the uid for the payload
        const { uid, ...payloadWithoutUid } = event;
        const values = [
            uid,
            event.constructor.name,
            JSON.stringify(payloadWithoutUid),
        ];

        await pool.query(query, values);
    }

    static async cleanup(): Promise<void> {
        await pool.end();
    }
}

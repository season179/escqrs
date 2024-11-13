// src/escqrs/EventStore.ts

import { Pool } from "pg";
import { CreditGrantedEvent } from "./CreditGrantedEvent";
import { config } from "dotenv";

config();

export const pool = new Pool({
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

    static async ensureBalanceTableExists(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS balances (
                uid VARCHAR(255) PRIMARY KEY,
                balance NUMERIC DEFAULT 0
            )
        `;
        await pool.query(query);
    }

    static async save(event: CreditGrantedEvent): Promise<void> {
        await this.ensureTableExists();

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get the current version for this aggregate
            const versionQuery = `
                SELECT COALESCE(MAX(version), 0) as current_version 
                FROM events 
                WHERE uid = $1
            `;
            const versionResult = await client.query(versionQuery, [event.uid]);
            const nextVersion = versionResult.rows[0].current_version + 1;

            // Insert the event with the next version
            const query = `
                INSERT INTO events (event_id, uid, type, version, payload) 
                VALUES ($1, $2, $3, $4, $5)
            `;
            const { eventId, uid, ...payloadWithoutMetadata } = event;
            const values = [
                eventId,
                uid,
                event.constructor.name,
                nextVersion,
                JSON.stringify(payloadWithoutMetadata)
            ];

            await client.query(query, values);
            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.constraint === 'events_uid_version_key') {
                throw new Error('Concurrent modification detected');
            }
            throw error;
        } finally {
            client.release();
        }
    }

    static async getBalanceByUid(uid: string): Promise<number> {
        const query = `
            SELECT SUM((payload->>'amount')::numeric) AS balance
            FROM events
            WHERE uid = $1 AND type = 'CreditGrantedEvent'
        `;
        const result = await pool.query(query, [uid]);

        // If there are no events, return a balance of 0
        return result.rows[0].balance ? parseFloat(result.rows[0].balance) : 0;
    }

    static async cleanup(): Promise<void> {
        await pool.end();
    }
}

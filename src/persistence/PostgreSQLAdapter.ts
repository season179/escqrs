import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import { BaseAdapter } from './BaseAdapter';
import type { DatabaseConfig, QueryResult, Transaction } from './types';

class PostgreSQLTransaction implements Transaction {
  constructor(private client: PoolClient) {}

  async execute(query: string, params?: any[]): Promise<QueryResult> {
    try {
      const result = await this.client.query(query, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount ?? 0
      };
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async commit(): Promise<void> {
    await this.client.query('COMMIT');
  }

  async rollback(): Promise<void> {
    await this.client.query('ROLLBACK');
  }
}

export class PostgreSQLAdapter extends BaseAdapter {
  private pool: Pool | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password
      });

      // Test the connection
      const client = await this.pool.connect();
      client.release();
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async execute(query: string, params?: any[]): Promise<QueryResult> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    try {
      const result = await this.pool.query(query, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount ?? 0
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async transaction<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const transaction = new PostgreSQLTransaction(client);
      const result = await fn(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw this.formatError(error);
    } finally {
      client.release();
    }
  }
}

import type { SagaData, SagaRepository } from "./types";
import type { DatabaseAdapter } from "../persistence/types";

export class SqlSagaRepository implements SagaRepository {
    private readonly tableName = "sagas";

    constructor(private readonly db: DatabaseAdapter) {}

    async initialize(): Promise<void> {
        await this.createSchema();
    }

    private async createSchema(): Promise<void> {
        const schema = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `;

        await this.db.execute(schema);
    }

    async save(sagaData: SagaData): Promise<void> {
        const query = `
      INSERT INTO ${this.tableName} (id, state, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        state = excluded.state,
        data = excluded.data,
        updated_at = excluded.updated_at;
    `;

        await this.db.execute(query, [
            sagaData.id,
            sagaData.state,
            JSON.stringify(sagaData.data),
            sagaData.createdAt,
            sagaData.updatedAt,
        ]);
    }

    async findById(id: string): Promise<SagaData | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const result = await this.db.execute(query, [id]);

        if (result.rowCount === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.id,
            state: row.state,
            data: JSON.parse(row.data),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }

    async delete(id: string): Promise<void> {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        await this.db.execute(query, [id]);
    }
}

import type { DatabaseAdapter } from "../persistence/types";
import type { Snapshot, SnapshotOptions } from "./types";

export class SnapshotManager {
    private readonly tableName = "snapshots";
    private snapshotThreshold: number;

    constructor(
        private readonly db: DatabaseAdapter,
        options: SnapshotOptions = { snapshotThreshold: 100 }
    ) {
        this.snapshotThreshold = options.snapshotThreshold;
    }

    async initialize(): Promise<void> {
        await this.createSchema();
    }

    private async createSchema(): Promise<void> {
        const schema = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        aggregate_id TEXT NOT NULL,
        aggregate_type TEXT NOT NULL,
        version INTEGER NOT NULL,
        state JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL,
        UNIQUE(aggregate_id, version)
      );
      
      CREATE INDEX IF NOT EXISTS idx_snapshots_aggregate_id ON ${this.tableName}(aggregate_id);
    `;
        await this.db.execute(schema);
    }

    async saveSnapshot(snapshot: Snapshot): Promise<void> {
        const query = `
      INSERT INTO ${this.tableName}
      (id, aggregate_id, aggregate_type, version, state, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (aggregate_id) DO UPDATE SET
        id = excluded.id,
        version = excluded.version,
        state = excluded.state,
        created_at = excluded.created_at;
    `;

        await this.db.execute(query, [
            snapshot.id,
            snapshot.aggregateId,
            snapshot.aggregateType,
            snapshot.version,
            JSON.stringify(snapshot.state),
            snapshot.createdAt,
        ]);
    }

    async getLatestSnapshot(aggregateId: string): Promise<Snapshot | undefined> {
        const query = `
          SELECT *
          FROM ${this.tableName}
          WHERE aggregate_id = ?
          ORDER BY version DESC
          LIMIT 1;
        `;
        const result = await this.db.execute(query, [aggregateId]);

        if (result.rowCount === 0) {
            return undefined;
        }

        const row = result.rows[0];
        return {
            id: row.id,
            aggregateId: row.aggregate_id,
            aggregateType: row.aggregate_type,
            version: row.version,
            state: JSON.parse(row.state),
            createdAt: new Date(row.created_at),
        };
    }

    async deleteSnapshotsBeforeVersion(
        aggregateId: string,
        version: number
    ): Promise<void> {
        const query = `
      DELETE FROM ${this.tableName}
      WHERE aggregate_id = ? AND version < ?;
    `;
        await this.db.execute(query, [aggregateId, version]);
    }
}

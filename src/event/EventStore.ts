import type { DatabaseAdapter, QueryResult } from "../persistence/types";
import type { EventData, EventStoreOptions, EventStreamOptions } from "./types";
import type { AggregateRoot } from "../aggregate/AggregateRoot";
import { EventBus } from "./EventBus";
import { SnapshotManager } from "../snapshot/SnapshotManager";
import type { Snapshot } from "../snapshot/types";

export class EventStore {
    private readonly tableName = "events";
    private snapshotManager: SnapshotManager;
    private snapshotFrequency: number;

    constructor(
        private readonly db: DatabaseAdapter,
        private readonly eventBus: EventBus,
        private readonly options: EventStoreOptions = {}
    ) {
        this.snapshotFrequency = options.snapshotFrequency || 100;
        this.snapshotManager = new SnapshotManager(db, {
            snapshotThreshold: this.snapshotFrequency,
        });
    }

    async initialize(): Promise<void> {
        await this.createSchema();
        await this.snapshotManager.initialize();
    }

    private async createSchema(): Promise<void> {
        const schema = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        aggregate_id TEXT NOT NULL,
        aggregate_type TEXT NOT NULL,
        event_type TEXT NOT NULL,
        version INTEGER NOT NULL,
        payload JSONB NOT NULL,
        metadata JSONB NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        UNIQUE(aggregate_id, version)
      );
      
      CREATE INDEX IF NOT EXISTS idx_events_aggregate_id ON ${this.tableName}(aggregate_id);
      CREATE INDEX IF NOT EXISTS idx_events_aggregate_type ON ${this.tableName}(aggregate_type);
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON ${this.tableName}(timestamp);
    `;

        await this.db.execute(schema);
    }

    async appendToStream(events: EventData[]): Promise<void> {
        if (!events.length) return;

        await this.db.transaction(async (transaction) => {
            for (const event of events) {
                // Check for version conflicts
                const existingEvent = await transaction.execute(
                    `SELECT version FROM ${this.tableName}
           WHERE aggregate_id = ? AND version = ?`,
                    [event.aggregateId, event.version]
                );

                if (existingEvent.rowCount > 0) {
                    throw new Error(
                        `Concurrency conflict: Event with version ${event.version} already exists for aggregate ${event.aggregateId}`
                    );
                }

                // Insert the event
                await transaction.execute(
                    `INSERT INTO ${this.tableName}
           (id, aggregate_id, aggregate_type, event_type, version, payload, metadata, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        event.id,
                        event.aggregateId,
                        event.aggregateType,
                        event.type,
                        event.version,
                        JSON.stringify(event.payload),
                        JSON.stringify(event.metadata),
                        event.timestamp,
                    ]
                );
            }
        });
    }

    async getEventStream(
        aggregateId: string,
        options: EventStreamOptions = {}
    ): Promise<EventData[]> {
        let query = `
      SELECT *
      FROM ${this.tableName}
      WHERE aggregate_id = ?
    `;
        const params: any[] = [aggregateId];

        if (options.fromVersion !== undefined) {
            query += " AND version >= ?";
            params.push(options.fromVersion);
        }

        if (options.toVersion !== undefined) {
            query += " AND version <= ?";
            params.push(options.toVersion);
        }

        query += " ORDER BY version ASC";

        const result = await this.db.execute(query, params);
        return this.mapEventsFromDb(result);
    }

    async getLastEventVersion(aggregateId: string): Promise<number> {
        const result = await this.db.execute(
            `SELECT MAX(version) as last_version
       FROM ${this.tableName}
       WHERE aggregate_id = ?`,
            [aggregateId]
        );

        return result.rows[0]?.last_version || 0;
    }

    async getEventsByType(
        eventType: string,
        fromTimestamp?: Date
    ): Promise<EventData[]> {
        let query = `
      SELECT *
      FROM ${this.tableName}
      WHERE event_type = ?
    `;
        const params: any[] = [eventType];

        if (fromTimestamp) {
            query += " AND timestamp >= ?";
            params.push(fromTimestamp);
        }

        query += " ORDER BY timestamp ASC";

        const result = await this.db.execute(query, params);
        return this.mapEventsFromDb(result);
    }

    private mapEventsFromDb(result: QueryResult): EventData[] {
        return result.rows.map((row) => ({
            id: row.id,
            aggregateId: row.aggregate_id,
            aggregateType: row.aggregate_type,
            type: row.event_type,
            version: row.version,
            payload: JSON.parse(row.payload),
            metadata: JSON.parse(row.metadata),
            timestamp: new Date(row.timestamp),
        }));
    }

    /**
     * Save the aggregate's uncommitted events and publish them
     */
    async save<T extends AggregateRoot>(aggregate: T): Promise<void> {
        console.log("Saving aggregate", aggregate.id);
        const events = aggregate.getUncommittedEvents();

        if (!events.length) return;

        await this.appendToStream(events);

        // Publish events to the event bus
        for (const event of events) {
            await this.eventBus.publish(event);
        }

        // Create a snapshot if necessary
        if (aggregate.version % this.snapshotFrequency === 0) {
            await this.createSnapshot(aggregate);
        }

        aggregate.clearUncommittedEvents();
    }

    /**
     * Load an aggregate by its ID
     */
    async load<T extends AggregateRoot>(
        aggregateType: { new (id: string): T },
        aggregateId: string
    ): Promise<T> {
        // Retrieve the latest snapshot
        const snapshot = await this.snapshotManager.getLatestSnapshot(
            aggregateId
        );
        let fromVersion = 0;

        const aggregate = new aggregateType(aggregateId);
        if (snapshot) {
            fromVersion = snapshot.version + 1;
        }

        const events = await this.getEventStream(aggregateId);

        aggregate.loadFromHistory(events, snapshot);

        return aggregate;
    }

    private async createSnapshot<T extends AggregateRoot>(
        aggregate: T
    ): Promise<void> {
        const snapshot: Snapshot = {
            id: aggregate.id,
            aggregateId: aggregate.id,
            aggregateType: aggregate.constructor.name,
            version: aggregate.version,
            state: aggregate.getState(),
            createdAt: new Date(),
        };

        await this.snapshotManager.saveSnapshot(snapshot);

        // Prune old snapshots
        const pruneVersion = aggregate.version - this.snapshotFrequency * 2;
        if (pruneVersion > 0) {
            await this.snapshotManager.deleteSnapshotsBeforeVersion(
                aggregate.id,
                pruneVersion
            );
        }
    }
}

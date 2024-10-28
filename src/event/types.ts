export interface EventData {
    id: string;
    aggregateId: string;
    aggregateType: string;
    type: string;
    version: number;
    payload: any;
    metadata: Record<string, any>;
    timestamp: Date;
}

export interface EventStoreOptions {
    snapshotFrequency?: number;
}

export interface EventStreamOptions {
    fromVersion?: number;
    toVersion?: number;
}

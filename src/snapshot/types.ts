export interface Snapshot {
    id: string;
    aggregateId: string;
    aggregateType: string;
    version: number;
    state: any;
    createdAt: Date;
}

export interface SnapshotOptions {
    snapshotThreshold: number; // Number of events after which a snapshot should be created
}

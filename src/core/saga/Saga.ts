// src/core/saga/Saga.ts
export interface Saga {
    id: string;
    type: string;
    status: SagaStatus;
    data: unknown;
    lastUpdated: Date;
}

export enum SagaStatus {
    STARTED = "STARTED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

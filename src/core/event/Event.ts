// src/core/event/Event.ts
export interface Event {
    id: string;
    type: string;
    aggregateId: string;
    uid: string;
    ebid?: string;
    version: number;
    timestamp: Date;
    payload: unknown;
    metadata?: Record<string, unknown>;
}

export interface Event {
    id: string;
    timestamp: Date;
    type: string;
    payload: any;
    aggregateId: string;
    version: number;
}

import type { Command } from "../command/types";
import type { Event } from "../event/types";

export interface SagaData {
    id: string;
    state: string;
    createdAt: Date;
    updatedAt: Date;
    data: any;
}

export interface Saga {
    id: string;
    state: string;
    data: any;
    createdAt: Date;

    /**
     * Starts the saga
     */
    start(): Promise<void>;

    /**
     * Handles events relevant to the saga
     */
    handleEvent(event: Event): Promise<void>;

    /**
     * Determines if the saga is completed
     */
    isCompleted(): boolean;

    hasTimedOut(): boolean;
}

export interface SagaMiddleware {
    execute(saga: Saga, next: () => Promise<void>): Promise<void>;
}

export interface SagaRepository {
    save(sagaData: SagaData): Promise<void>;
    findById(id: string): Promise<SagaData | null>;
    delete(id: string): Promise<void>;
}

export interface SagaManager {
    startSaga(sagaType: new (...args: any[]) => Saga, data: any): Promise<void>;
    handleEvent(event: Event): Promise<void>;
}

export class SagaNotFoundError extends Error {
    constructor(sagaId: string) {
        super(`Saga not found with ID: ${sagaId}`);
        this.name = "SagaNotFoundError";
    }
}

export class EventStoreError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly originalError?: Error
    ) {
        super(message);
        this.name = "EventStoreError";
    }

    static concurrencyError(
        aggregateId: string,
        version: number
    ): EventStoreError {
        return new EventStoreError(
            `Concurrency conflict: Event with version ${version} already exists for aggregate ${aggregateId}`,
            "CONCURRENCY_ERROR"
        );
    }

    static connectionError(error: Error): EventStoreError {
        return new EventStoreError(
            "Failed to connect to event store",
            "CONNECTION_ERROR",
            error
        );
    }
}

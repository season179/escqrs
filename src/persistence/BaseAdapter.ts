import type {
    DatabaseAdapter,
    DatabaseConfig,
    QueryResult,
    Transaction,
} from "./types";

export abstract class BaseAdapter implements DatabaseAdapter {
    protected constructor(protected config: DatabaseConfig) {}

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract execute(query: string, params?: any[]): Promise<QueryResult>;
    abstract transaction<T>(
        fn: (transaction: Transaction) => Promise<T>
    ): Promise<T>;

    protected formatError(error: any): Error {
        console.log(error);
        return new Error(`Database error: ${error}`);
    }
}

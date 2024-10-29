export interface Transaction {
    execute(query: string, params?: any[]): Promise<any>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}

export interface DatabaseConfig {
    host?: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    filename?: string; // for SQLite
}

export interface QueryResult {
    rows: any[];
    rowCount: number;
}

export interface DatabaseAdapter {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    execute(query: string, params?: any[]): Promise<QueryResult>;
    transaction<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T>;
}

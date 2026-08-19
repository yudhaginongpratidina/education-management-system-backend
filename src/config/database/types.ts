export type DatabaseEngine = 'postgres' | 'mysql' | 'mongo';
export type QueryResultRow = Record<string, any>;
export interface BaseDatabaseConfig {
    name: string;
    engine: DatabaseEngine;
    host: string;
    port: number;
    username?: string;
    password?: string;
    database: string;
    maxConnection?: number;
    idleTimeout?: number;
    connectionTimeout?: number;
    readOnly?: boolean;
}
export interface QueryResult<T = any> {
    rows: T[];
    rowCount?: number;
}
export interface DatabaseClient {
    query<T extends QueryResultRow = any>(query: string, params?: any[]): Promise<QueryResult<T>>;
    transaction?<T>(callback: (client: TransactionClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
}
export interface TransactionClient {
    query<T extends QueryResultRow = any>(query: string, params?: any[]): Promise<QueryResult<T>>;
}
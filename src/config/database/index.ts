import { env } from '../env';
import type { BaseDatabaseConfig, DatabaseClient} from './types';
import { PostgresClient } from './postgres';
import { MysqlClient } from './mysql';

class DatabaseManager {
    private clients: Map<string, DatabaseClient> = new Map();
    private tenantClients: Map<string, DatabaseClient> = new Map();

    constructor() {
        this.initialize();
    }

    private initialize() {
        for (const dbConfig of env.databases) {
            const client = this.createClient(dbConfig);
            this.clients.set(dbConfig.name, client);
        }
    }

    private createClient(config: BaseDatabaseConfig): DatabaseClient {
        switch (config.engine) {
            case 'postgres':
                return new PostgresClient(config);
            case 'mysql':
                return new MysqlClient(config);
            default:
                throw new Error(`Unsupported engine: ${config.engine}`);
        }
    }

    // -----------------------------------------------------------------------
    // GET DB BY NAME
    // -----------------------------------------------------------------------
    get(name: string): DatabaseClient {
        const client = this.clients.get(name);
        if (!client) {
            throw new Error(`Database not found: ${name}`);
        }
        return client;
    }


    // -----------------------------------------------------------------------
    // GET DB BY NAME
    // -----------------------------------------------------------------------
    getPrimary(): DatabaseClient {
        return this.get('main');
    }

    // -----------------------------------------------------------------------
    // EXAMPLE : GET READ ONLY DB
    // -----------------------------------------------------------------------
    getReadReplica(): DatabaseClient | null {
        for (const [_, client] of this.clients) {
            // naive check (you can improve later)
            return client;
        }
        return null;
    }

    async closeAll() {
        for (const client of this.clients.values()) {
            await client.close();
        }
        for (const client of this.tenantClients.values()) {
            await client.close();
        }
    }
}

export const databaseManager = new DatabaseManager();
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../models';
import * as dotenv from 'dotenv';
import { injectable } from 'inversify';

dotenv.config();

@injectable()
export class DatabaseConnection {
    public readonly pool: Pool;
    public readonly db: NodePgDatabase<typeof schema>;

    constructor() {
        if (process.env.DATABASE_URL) {
            console.log('Initializing DatabaseConnection with DATABASE_URL');
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL
            });
        } else {
            const dbConfig = {
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '5432'),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                max: parseInt(process.env.DB_POOL_MAX || '20'),
                min: parseInt(process.env.DB_POOL_MIN || '5'),
            };
            console.log(`Initializing DatabaseConnection with host: ${dbConfig.host}, port: ${dbConfig.port}, user: ${dbConfig.user}, db: ${dbConfig.database}`);
            this.pool = new Pool(dbConfig);
        }
        this.db = drizzle(this.pool, { schema });
    }
}


export const dbConnection = new DatabaseConnection();
export const db = dbConnection.db;

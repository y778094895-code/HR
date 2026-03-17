
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env
dotenv.config({ path: resolve(__dirname, '../../.env') });

const runMigration = async () => {
    // Construct connection string from .env vars if DATABASE_URL is not set
    let connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        const host = process.env.DB_HOST === 'postgres' ? 'localhost' : (process.env.DB_HOST || 'localhost');
        const port = process.env.DB_PORT || '5432';
        const user = process.env.DB_USER || 'hr';
        const password = process.env.DB_PASSWORD || 'saeed';
        const dbName = process.env.DB_NAME || 'hr_system';

        connectionString = `postgres://${user}:${password}@${host}:${port}/${dbName}`;
    }

    console.log(`Target Database: ${connectionString.replace(/:[^:@]+@/, ':***@')}`); // Log masked string for verification
    const isDryRun = process.env.MIGRATE_DRY_RUN === '1' || process.env.MIGRATE_DRY_RUN === 'true';

    console.log(`Connecting to database...`);
    if (isDryRun) {
        console.log('[DRY RUN] Connection established (simulated).');
        console.log('[DRY RUN] Would look for migrations in:', resolve(__dirname, '../../postgres/migrations'));
        console.log('[DRY RUN] Skipping actual migration execution.');
        return;
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        const db = drizzle(client);

        console.log('Running versioned SQL migrations...');

        // This accepts a custom migrationsFolder
        await migrate(db, { migrationsFolder: resolve(__dirname, '../../postgres/migrations') });

        console.log('✅ Migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
};

runMigration();

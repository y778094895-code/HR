
import { db } from '../data/database/connection';
import { sql } from 'drizzle-orm';
import { outbox } from '../data/models/outbox.schema';

async function test() {
    console.log('Testing DB connection...');
    try {
        const result = await db.execute(sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`);
        console.log('Tables in DB:', result.rows.map(r => r.tablename));
        const currentDb = await db.execute(sql`SELECT current_database()`);
        console.log('Connected to DB:', currentDb.rows[0].current_database);
    } catch (error) {
        console.error('Query failed:', error);
    }
    process.exit(0);
}

test();

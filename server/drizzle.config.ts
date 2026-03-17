import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from root directory
dotenv.config({ path: resolve(__dirname, '../.env') });

export default {
    schema: './data/models/index.ts',
    out: '../postgres/migrations',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || "postgres://hr:saeed@localhost:5432/hr_system",
    },
} satisfies Config;

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://hr:saeed@localhost:5433/hr_system"
});

async function runRecovery() {
    console.log('Starting DB Schema Recovery...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Data Quality - violations table
        console.log('Ensuring violations table has status column...');
        await client.query(`
            ALTER TABLE "violations" 
            ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'open';
        `);

        // 2. Help Center - categories, articles, faqs
        console.log('Creating help center tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "help_categories" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" VARCHAR(100) NOT NULL,
                "slug" VARCHAR(100) UNIQUE NOT NULL,
                "description" TEXT,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS "help_articles" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "category_id" UUID REFERENCES "help_categories"("id") ON DELETE SET NULL,
                "title" VARCHAR(255) NOT NULL,
                "slug" VARCHAR(100) UNIQUE NOT NULL,
                "content" TEXT NOT NULL,
                "version" INTEGER DEFAULT 1,
                "is_published" BOOLEAN DEFAULT false,
                "search_keywords" JSONB DEFAULT '[]',
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS "help_faqs" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "category_id" UUID REFERENCES "help_categories"("id") ON DELETE SET NULL,
                "question" VARCHAR(255) NOT NULL,
                "answer" TEXT NOT NULL,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // 3. Support Tickets - tickets, messages
        console.log('Creating support ticket tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "help_tickets" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
                "subject" VARCHAR(255) NOT NULL,
                "description" TEXT,
                "status" VARCHAR(50) DEFAULT 'open',
                "priority" VARCHAR(20) DEFAULT 'medium',
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "closed_at" TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS "help_ticket_messages" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "ticket_id" UUID REFERENCES "help_tickets"("id") ON DELETE CASCADE NOT NULL,
                "sender_id" UUID REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
                "message" TEXT NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        await client.query('COMMIT');
        console.log('DB Schema Recovery completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error during Schema Recovery:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

runRecovery().catch(console.error);

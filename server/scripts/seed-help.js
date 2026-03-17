const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://hr:saeed@localhost:5433/hr_system"
});

async function runSeed() {
    console.log('Starting minimal baseline Help seeder...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if categories exist
        const result = await client.query('SELECT COUNT(*) as count FROM help_categories');
        if (parseInt(result.rows[0].count) > 0) {
            console.log('Help schema is already seeded. Exiting.');
            await client.query('COMMIT');
            return;
        }

        console.log('Seeding minimal Categories...');
        const catRes = await client.query(`
            INSERT INTO help_categories (name, slug, description)
            VALUES 
                ('Getting Started', 'getting-started', 'Basic instructions for the platform'),
                ('Performance Appraisals', 'performance-appraisals', 'Help regarding performance management'),
                ('Troubleshooting', 'troubleshooting', 'Solutions for common problems')
            RETURNING id;
        `);
        const catId = catRes.rows[0].id;

        console.log('Seeding minimal FAQs...');
        await client.query(`
            INSERT INTO help_faqs (category_id, question, answer)
            VALUES 
                ($1, 'How do I reset my password?', 'Go to Settings > Security and click Change Password.'),
                ($1, 'How do I contact support?', 'You can raise a support ticket under the Help section.')
        `, [catId]);

        console.log('Seeding minimal Articles...');
        await client.query(`
            INSERT INTO help_articles (category_id, title, slug, content, is_published)
            VALUES 
                ($1, 'Welcome to Smart HR', 'welcome-smart-hr', 'This represents a minimal baseline operational article to ensure empty states are legitimate.', true),
                ($1, 'Setting up your Profile', 'setting-up-profile', 'To set up your profile, navigate to Settings > Profile.', true)
        `, [catId]);

        await client.query('COMMIT');
        console.log('Help Seeding completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error during Seeding:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

runSeed().catch(console.error);

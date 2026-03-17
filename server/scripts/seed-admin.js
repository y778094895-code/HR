const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

// In Docker, env vars are injected, but for local run attempt to load.
// The path '../.env' is relative to 'scripts/'.
dotenv.config({ path: '../.env' });

const dbConfig = {
    connectionString: process.env.DATABASE_URL || "postgresql://hr:saeed@localhost:5432/hr_system"
};

async function seed() {
    console.log('Seeding admin user...');

    // Adjust connection string for localhost if running from outside docker but using docker-compose ports
    // If running inside container, 'postgres' host is fine.
    // We will assume this is run from OUTSIDE (e.g. via ts-node) or inside.
    // Docker internal: postgres://hr:saeed@postgres:5432/hr_system
    // Localhost: postgres://hr:saeed@localhost:5432/hr_system

    // We'll use the env var but ensuring we can connect.
    console.log(`Connecting to ${dbConfig.connectionString}`);

    const client = new Client(dbConfig);
    await client.connect();

    try {
        const email = 'admin@smart-hr.com';
        const password = 'Admin@123';
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const checkRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            console.log('Admin user already exists.');
        } else {
            const query = `
                INSERT INTO users (id, email, username, password_hash, full_name, role, is_active)
                VALUES (gen_random_uuid(), $1, 'admin', $2, 'System Admin', 'admin', true)
                RETURNING id;
            `;
            const res = await client.query(query, [email, hash]);
            console.log(`Admin user created with ID: ${res.rows[0].id}`);
        }
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.end();
    }
}

seed();

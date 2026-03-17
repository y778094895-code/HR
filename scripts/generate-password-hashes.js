// Generate BCrypt password hashes for database initialization
// Run with: node scripts/generate-password-hashes.js

const bcrypt = require('bcrypt');

const users = [
    { email: 'admin@smart-hr.com', password: 'Admin@123', role: 'admin' },
    { email: 'hr@smart-hr.com', password: 'HR@123', role: 'hr_manager' },
    { email: 'manager@smart-hr.com', password: 'Manager@123', role: 'manager' },
    { email: 'employee@smart-hr.com', password: 'Employee@123', role: 'employee' },
];

async function generateHashes() {
    console.log('Generating BCrypt password hashes (salt rounds: 10)...\n');

    for (const user of users) {
        const hash = await bcrypt.hash(user.password, 10);
        console.log(`-- ${user.role} (${user.email})`);
        console.log(`-- Password: ${user.password}`);
        console.log(`'${hash}',\n`);
    }

    console.log('\nCopy these hashes to postgres/init.sql');
}

generateHashes().catch(console.error);

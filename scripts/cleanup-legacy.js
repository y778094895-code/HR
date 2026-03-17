const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '..', `legacy-backup-${new Date().toISOString().split('T')[0]}`);
const clientComponentsDir = path.join(__dirname, '..', 'client', 'src', 'components');
const legacyFiles = [
    path.join(clientComponentsDir, 'v0_admin_dashboard'),
    path.join(clientComponentsDir, 'v0_employees'),
    path.join(__dirname, '..', 'client', 'src', 'lib', 'v0-mock-data.ts'),
    path.join(__dirname, '..', 'client', 'src', 'pages', 'dashboard', 'V0AdminDashboardPage.tsx'),
    path.join(__dirname, '..', 'client', 'src', 'pages', 'dashboard', 'V0EmployeesPage.tsx')
];

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`Created backup directory: ${backupDir}`);
}

legacyFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const dest = path.join(backupDir, path.basename(file));
        fs.renameSync(file, dest);
        console.log(`Moved ${file} to ${dest}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});

console.log('Legacy cleanup complete. Please verify the system still works.');

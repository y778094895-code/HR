const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const reportFile = path.join(projectRoot, 'docs', 'verification', 'completeness-report.md');
const reportDir = path.dirname(reportFile);

if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

let reportContent = '# Architecture Completeness Report\n\n';
let violations = [];

function checkDirectoryExists(dirPath, name) {
    if (fs.existsSync(dirPath)) {
        reportContent += `- [x] Directory exists: \`${name}\`\n`;
        return true;
    } else {
        reportContent += `- [ ] Missing Directory: \`${name}\`\n`;
        violations.push(`Missing Directory: ${name}`);
        return false;
    }
}

function checkFileExists(filePath, name) {
    if (fs.existsSync(filePath)) {
        reportContent += `- [x] File exists: \`${name}\`\n`;
        return true;
    } else {
        reportContent += `- [ ] Missing File: \`${name}\`\n`;
        violations.push(`Missing File: ${name}`);
        return false;
    }
}

reportContent += '## Directory Structure Compliance\n';
checkDirectoryExists(path.join(projectRoot, 'server', 'api', 'controllers'), 'server/api/controllers');
checkDirectoryExists(path.join(projectRoot, 'server', 'services', 'business'), 'server/services/business');
checkDirectoryExists(path.join(projectRoot, 'server', 'data', 'repositories'), 'server/data/repositories');
checkDirectoryExists(path.join(projectRoot, 'client', 'src', 'components', 'ui'), 'client/src/components/ui');
checkDirectoryExists(path.join(projectRoot, 'client', 'src', 'components', 'features'), 'client/src/components/features');
checkDirectoryExists(path.join(projectRoot, 'ml-service', 'api'), 'ml-service/api');

reportContent += '\n## Violation Summary\n';
if (violations.length === 0) {
    reportContent += '✅ No architectural violations found.\n';
} else {
    reportContent += `Found ${violations.length} violations:\n`;
    violations.forEach(v => reportContent += `- ${v}\n`);
}

fs.writeFileSync(reportFile, reportContent);
console.log(`Audit complete. Report generated at ${reportFile}`);

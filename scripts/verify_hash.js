const bcrypt = require('bcrypt');

const password = 'Admin@123';
const hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

bcrypt.compare(password, hash).then(result => {
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log(`Match: ${result}`);
}).catch(err => console.error(err));

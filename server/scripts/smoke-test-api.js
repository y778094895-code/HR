const http = require('http');

const loginPayload = JSON.stringify({
    email: 'admin@smart-hr.com',
    password: 'Admin@123'
});

const loginOptions = {
    hostname: 'gateway', // Inside docker network
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginPayload.length
    }
};

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, body: json });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    console.log('1. Logging in...');
    try {
        const loginRes = await request(loginOptions, loginPayload);
        console.log('Login Status:', loginRes.statusCode);

        if (loginRes.statusCode !== 200 && loginRes.statusCode !== 201) {
            console.error('Login failed:', loginRes.body);
            return;
        }

        const token = loginRes.body.accessToken || loginRes.body.token;
        if (!token) {
            console.error('No token received:', loginRes.body);
            return;
        }
        console.log('Token received.');

        console.log('2. Fetching Employees...');
        const empOptions = {
            hostname: 'gateway',
            port: 8080,
            path: '/api/employees',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const empRes = await request(empOptions);
        console.log('Employees Status:', empRes.statusCode);
        if (empRes.statusCode === 200) {
            console.log('Employees Response Sample:', JSON.stringify(empRes.body, null, 2).substring(0, 500) + '...');
        } else {
            console.error('Employees fetch failed:', empRes.body);
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

run();

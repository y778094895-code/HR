const http = require('http');

const loginPayload = JSON.stringify({
    email: 'admin@smart-hr.com',
    password: 'Admin@123'
});

const loginOptions = {
    hostname: 'localhost',
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
    console.log('1. Logging in (Host -> Gateway)...');
    try {
        const loginRes = await request(loginOptions, loginPayload);
        console.log('Login Status:', loginRes.statusCode);

        if (loginRes.statusCode !== 200 && loginRes.statusCode !== 201) {
            console.error('Login failed:', loginRes.body);
            return;
        }

        const token = loginRes.body.accessToken || loginRes.body.token || (loginRes.body.data && loginRes.body.data.access_token);
        if (!token) {
            console.error('No token received:', loginRes.body);
            return;
        }
        console.log('Token received.');

        console.log('2. Fetching Employees...');
        const empOptions = {
            hostname: 'localhost',
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
            // Check CamelCase
            const sample = empRes.body.data ? empRes.body.data[0] : (Array.isArray(empRes.body) ? empRes.body[0] : empRes.body);
            console.log('Employees Response Sample:', JSON.stringify(sample, null, 2));
        } else {
            console.error('Employees fetch failed:', empRes.body);
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

run();

const request = require('supertest');
const jwt = require('jsonwebtoken');
import { dbConnection } from '../../data/database/connection';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://gateway:8080';

describe.skip('Full System Integration', () => {
    let token: string;

    beforeAll(async () => {
        // Authenticate or setup
        const secret = process.env.JWT_SECRET || 'top-secret';
        token = jwt.sign({ sub: 'test-user', role: 'admin', privileges: [] }, secret, { expiresIn: '1h' });
    });

    afterAll(async () => {
        try {
            await dbConnection.pool.end();
        } catch (e) { }
    });

    it('should handle employee creation and event publishing', async () => {
        // 1. Create employee via API
        const response = await request(GATEWAY_URL)
            .post('/api/employees')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fullName: 'Test Employee',
                employeeCode: `EMP-${Date.now()}`,
                erpnextId: `ERP-${Date.now()}`,
                department: 'Engineering',
                position: 'Developer',
                email: `test-${Date.now()}@example.com`,
                dateOfJoining: new Date().toISOString().split('T')[0]
            });

        expect(response.status).toBe(201);

        if (response.body.data && response.body.data.id) {
            const employeeId = response.body.data.id;
        }

        // 2. Verify Event in RabbitMQ (Mocked or checked via API if possible)
        // In a real test, we might check a side effect, e.g. ML service log or database update

        // 3. Verify ML Service prediction (simulated delay)
        // await new Promise(resolve => setTimeout(resolve, 5000));
        // const risk = await request(GATEWAY_URL).get(`/api/v1/ml/predictions/${employeeId}`);
        // expect(risk.status).toBe(200);
    });

    it('should trigger circuit breaker when service is down', async () => {
        // Simulate service down or use a non-existent route mapped to a service
        // This is hard to test without controlling docker from test
    });
});

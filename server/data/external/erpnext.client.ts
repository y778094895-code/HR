import { injectable } from 'inversify';

@injectable()
export class ERPNextClient {
    async syncEmployee(_employeeId: string) {
        // Mock implementation
        return { synced: true, erpId: 'ERP-123' };
    }
}

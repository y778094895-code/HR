import 'reflect-metadata';
import { DashboardController } from '../../api/controllers/dashboard.controller';
import { DashboardService } from '../../services/application/dashboard.service';

// A simple mock request and response for Express
const mockRequest = () => {
    return {} as any;
};

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('DashboardController', () => {
    let controller: DashboardController;
    let mockDashboardService: Partial<DashboardService>;

    beforeEach(() => {
        mockDashboardService = {
            getStats: jest.fn().mockResolvedValue({
                kpis: [{ id: 'total-employees', title: 'Total Employees', value: 100 }],
                trends: [{ name: 'Current', value: 100 }]
            })
        };
        controller = new DashboardController(mockDashboardService as DashboardService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return stats formatted with ApiResponse', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await controller.getStats(req, res);

        expect(res.json).toHaveBeenCalled();
        const callArg = res.json.mock.calls[0][0];

        // Check if wrapped in our ApiResponse shape
        expect(callArg.success).toBe(true);
        expect(callArg.data).toHaveProperty('kpis');
        expect(callArg.data).toHaveProperty('trends');

        // Detailed checking
        expect(callArg.data.kpis.length).toBeGreaterThan(0);
        expect(callArg.data.trends.length).toBeGreaterThan(0);
    });
});

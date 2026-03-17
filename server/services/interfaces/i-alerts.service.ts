import { AlertDetailsDto, AlertDto } from '../../shared/dtos/alert.dto';

export interface IAlertsService {
    getAlerts(filters?: any): Promise<{ items: AlertDto[]; total: number }>;
    getAlertDetails(alertId: string): Promise<AlertDetailsDto>;
    logAlertAction(alertId: string, action: string, userId: string, payload?: any): Promise<{ success: boolean; eventId: string; toStatus?: string }>;
}

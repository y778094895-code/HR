export interface IReportsService {
    getTemplates(): Promise<any[]>;
    requestReport(config: any): Promise<any>;
    getReportStatus(jobId: string): Promise<any>;
    completeReport(jobId: string, userId: string): Promise<{ success: boolean; jobId: string; message: string }>;
    getReportDownloadStream(jobId: string): Promise<{ stream: any, format: string, filename: string }>;
}

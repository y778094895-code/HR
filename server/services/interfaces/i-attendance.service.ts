export interface IAttendanceService {
    getAttendanceRecords(filters: any): Promise<any>;
    getAttendanceById(id: string): Promise<any>;
    getEmployeeAttendance(employeeId: string): Promise<any>;
    createAttendance(data: any): Promise<any>;
    updateAttendance(id: string, data: any): Promise<any>;
    deleteAttendance(id: string): Promise<any>;
}

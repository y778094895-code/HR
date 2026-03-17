import { useEmployeeStore } from '../business/employee.store';

export const useAllEmployees = () => useEmployeeStore((state) => state.employees);
export const useEmployeeLoading = () => useEmployeeStore((state) => state.loading);
export const useEmployeeError = () => useEmployeeStore((state) => state.error);
export const useEmployeeTotal = () => useEmployeeStore((state) => state.total);
export const useEmployeeParams = () => useEmployeeStore((state) => state.params);
export const useSelectedEmployee = () => useEmployeeStore((state) => state.selectedEmployee);

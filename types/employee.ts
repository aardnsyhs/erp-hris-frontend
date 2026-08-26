import { Department } from './department';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED';

export interface Employee {
  id: string;
  departmentId: string;
  nip: string;
  fullName: string;
  email: string;
  phone: string | null;
  jobTitle: string;
  hireDate: string;
  baseSalary?: string | number;
  status: EmployeeStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  department?: Department;
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  } | null;
}

export interface CreateEmployeeDto {
  departmentId: string;
  nip: string;
  fullName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  hireDate: string | Date;
  baseSalary: string;
  status?: EmployeeStatus;
}

export interface UpdateEmployeeDto {
  departmentId?: string;
  nip?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  hireDate?: string | Date;
  baseSalary?: string;
  status?: EmployeeStatus;
}

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: EmployeeStatus;
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'PAID';

export interface PayrollEmployee {
  id: string;
  nip: string;
  fullName: string;
  jobTitle: string;
  departmentId?: string;
  department?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employee?: PayrollEmployee | null;
  periodStart: string;
  periodEnd: string;
  basicSalary?: string | number;
  allowances?: string | number;
  deductions?: string | number;
  netSalary?: string | number;
  status: PayrollStatus;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayrollDto {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  allowances?: string;
  deductions?: string;
}

export interface UpdatePayrollDto {
  allowances?: string;
  deductions?: string;
}

export interface PayrollQueryParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  departmentId?: string;
  status?: PayrollStatus;
  periodStart?: string;
  periodEnd?: string;
}

export interface PayrollListResponse {
  data: Payroll[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

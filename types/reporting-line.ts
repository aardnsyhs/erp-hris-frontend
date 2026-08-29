export interface EmployeeReportingLine {
  id: string;
  employeeId: string;
  managerId: string;
  manager?: {
    id: string;
    nip: string;
    fullName: string;
    jobTitle: string;
    email: string;
  } | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportingLineInput {
  managerId: string;
  effectiveFrom: string;
  isPrimary?: boolean;
}

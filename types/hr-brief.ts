export interface HrBriefFilters {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
}

export interface BriefEmployee {
  id: string;
  fullName: string;
  nip: string;
}
export interface BriefCollection<T> {
  total: number;
  items: T[];
  remaining: number;
  limit: number;
}
export interface BriefLeave {
  id: string;
  employeeId: string;
  employee: BriefEmployee;
  startDate: string;
  endDate: string;
  createdAt: string;
  datesPassed: boolean;
}
export interface BriefContract {
  id: string;
  employeeId: string;
  employee: BriefEmployee;
  contractNumber: string;
  endDate: string;
}
export interface BriefPayrollGroup {
  periodStart: string;
  periodEnd: string;
  status: 'DRAFT' | 'PROCESSED';
  total: number;
}
export interface BriefPayroll extends Omit<BriefPayrollGroup, 'total'> {
  id: string;
  employeeId: string;
  employee: BriefEmployee;
}
export interface HrBrief {
  period: { startDate: string; endDate: string };
  referenceDate: string;
  timezone: 'Asia/Jakarta';
  generatedAt: string;
  departmentId: string | null;
  contractHorizon: { days: number; endDate: string };
  attendance: {
    PRESENT: number;
    LATE: number;
    ABSENT: number;
    recordedEmployeeDays: number;
  };
  open: {
    total: number;
    leaves: BriefCollection<BriefLeave>;
    upcomingContracts: BriefCollection<BriefContract>;
    expiredActiveContracts: BriefCollection<BriefContract>;
    payrolls: BriefCollection<BriefPayroll> & { groups: BriefPayrollGroup[] };
  };
}

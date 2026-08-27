export type LeaveType = 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY';

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequestEmployee {
  id: string;
  nip: string;
  fullName: string;
  email: string;
  jobTitle: string;
  departmentId: string;
  department?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  approvedBy: string | null;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveRequestStatus;
  reason: string;
  rejectionReason: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: LeaveRequestEmployee;
  approver?: LeaveRequestEmployee | null;
}

export interface CreateLeaveRequestDto {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface RejectLeaveRequestDto {
  rejectionReason: string;
}

export interface LeaveRequestQueryParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  departmentId?: string;
  status?: LeaveRequestStatus;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
}

export interface LeaveRequestListResponse {
  data: LeaveRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

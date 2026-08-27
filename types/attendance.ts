export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export interface Attendance {
  id: string;
  employeeId: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  notes: string | null;
  employee?: {
    id: string;
    nip: string;
    fullName: string;
    email: string;
    phone?: string | null;
    jobTitle: string;
    departmentId: string;
    department?: {
      id: string;
      code: string;
      name: string;
    };
  };
}

export interface CheckInDto {
  notes?: string;
}

export interface CheckOutDto {
  notes?: string;
}

export interface AttendanceQueryParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  departmentId?: string;
  status?: AttendanceStatus;
  startDate?: string;
  endDate?: string;
}

export interface AttendanceListResponse {
  data: Attendance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

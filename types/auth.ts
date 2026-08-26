export type UserRole = 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  employeeId?: string | null;
  employee?: {
    id: string;
    nip: string;
    fullName: string;
    jobTitle: string;
    departmentId: string;
    department?: {
      id: string;
      code: string;
      name: string;
    } | null;
  } | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export type UserRole = 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface AuthUserEmployee {
  id: string;
  nip: string;
  fullName: string;
  email: string;
  phone?: string | null;
  jobTitle: string;
  hireDate?: string | null;
  status?: string | null;
  departmentId?: string | null;
  department?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  employeeId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  employee?: AuthUserEmployee | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

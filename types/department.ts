export type DepartmentStatus = 'ACTIVE' | 'ARCHIVED' | 'ALL';

export interface Department {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
  };
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
}

export interface UpdateDepartmentDto {
  code?: string;
  name?: string;
}

export interface ArchiveDepartmentDto {
  reason?: string;
}

export interface RestoreDepartmentDto {
  reason?: string;
}

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: DepartmentStatus;
}

export interface DepartmentListResponse {
  data: Department[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

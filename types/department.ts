export type DepartmentStatus = 'ACTIVE' | 'ARCHIVED' | 'ALL';

export interface DepartmentTreeNode {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  archivedAt: string | null;
  parentId: string | null;
  level: number;
  _count?: {
    employees: number;
    children?: number;
  };
  children: DepartmentTreeNode[];
}

export interface Department {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  archivedAt: string | null;
  parentId?: string | null;
  level?: number;
  parent?: {
    id: string;
    code: string;
    name: string;
    level: number;
  } | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
  };
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  parentId?: string;
}

export interface UpdateDepartmentDto {
  code?: string;
  name?: string;
}

export interface ReparentDepartmentDto {
  parentId: string | null;
  reason?: string;
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

export interface DepartmentTreeQueryParams {
  includeArchived?: boolean;
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


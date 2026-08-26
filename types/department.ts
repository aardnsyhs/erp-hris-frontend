export interface Department {
  id: string;
  code: string;
  name: string;
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

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
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

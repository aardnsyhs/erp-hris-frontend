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

export interface DepartmentListResponse {
  data: Department[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

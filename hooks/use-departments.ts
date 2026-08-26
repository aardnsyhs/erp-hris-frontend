import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { DepartmentListResponse } from '@/types/department';

export function useDepartments(params?: { limit?: number; page?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.departments.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<DepartmentListResponse>('/departments', {
        params: {
          limit: params?.limit ?? 100,
          page: params?.page ?? 1,
          search: params?.search,
        },
      });
      return data;
    },
  });
}

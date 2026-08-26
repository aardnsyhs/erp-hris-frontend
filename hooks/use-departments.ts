import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  CreateDepartmentDto,
  Department,
  DepartmentListResponse,
  DepartmentQueryParams,
  UpdateDepartmentDto,
} from '@/types/department';
import { toast } from 'sonner';

export function useDepartments(params?: DepartmentQueryParams) {
  return useQuery({
    queryKey: queryKeys.departments.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<DepartmentListResponse>('/departments', {
        params: {
          limit: params?.limit ?? 10,
          page: params?.page ?? 1,
          search: params?.search?.trim() || undefined,
        },
      });
      return data;
    },
  });
}

export function useDepartment(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.departments.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Department>(`/departments/${id}`);
      return data;
    },
    enabled: !!id && enabled,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDepartmentDto) => {
      const { data } = await apiClient.post<Department>('/departments', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success(`Departemen "${data.name}" (${data.code}) berhasil ditambahkan.`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal menambahkan departemen.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDepartmentDto;
    }) => {
      const { data } = await apiClient.patch<Department>(`/departments/${id}`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success(`Data departemen "${data.name}" berhasil diperbarui.`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal memperbarui departemen.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<{ message: string }>(`/departments/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success('Departemen berhasil dihapus.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal menghapus departemen.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

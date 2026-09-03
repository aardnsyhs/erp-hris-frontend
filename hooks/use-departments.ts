import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  ArchiveDepartmentDto,
  CreateDepartmentDto,
  Department,
  DepartmentListResponse,
  DepartmentQueryParams,
  RestoreDepartmentDto,
  UpdateDepartmentDto,
} from '@/types/department';
import { toast } from 'sonner';

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
  }
  return defaultMessage;
}

export function useDepartments(params?: DepartmentQueryParams) {
  return useQuery({
    queryKey: queryKeys.departments.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<DepartmentListResponse>('/departments', {
        params: {
          limit: params?.limit ?? 10,
          page: params?.page ?? 1,
          search: params?.search?.trim() || undefined,
          status: params?.status,
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Gagal menambahkan departemen.'));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Gagal memperbarui departemen.'));
    },
  });
}

export function useArchiveDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload?: ArchiveDepartmentDto;
    }) => {
      const { data } = await apiClient.patch<Department>(
        `/departments/${id}/archive`,
        payload || {},
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success(`Departemen "${data.name}" (${data.code}) berhasil diarsipkan.`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Gagal mengarsipkan departemen.'));
    },
  });
}

export function useRestoreDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload?: RestoreDepartmentDto;
    }) => {
      const { data } = await apiClient.patch<Department>(
        `/departments/${id}/restore`,
        payload || {},
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success(
        `Departemen "${data.name}" (${data.code}) berhasil diaktifkan kembali.`,
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Gagal mengaktifkan kembali departemen.'));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Gagal menghapus departemen.'));
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  CreateEmployeeDto,
  CreateEmployeeResponse,
  Employee,
  EmployeeListResponse,
  EmployeeQueryParams,
  UpdateEmployeeDto,
} from '@/types/employee';
import { toast } from 'sonner';

export function useEmployees(params?: EmployeeQueryParams) {
  return useQuery({
    queryKey: queryKeys.employees.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<EmployeeListResponse>('/employees', {
        params: {
          limit: params?.limit ?? 10,
          page: params?.page ?? 1,
          search: params?.search,
          departmentId: params?.departmentId,
          status: params?.status,
        },
      });
      return data;
    },
  });
}

export function useEmployee(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Employee>(`/employees/${id}`);
      return data;
    },
    enabled: !!id && enabled,
    retry: (failureCount, error: any) => {
      // Don't retry on 403 Forbidden or 404 Not Found
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEmployeeDto) => {
      const { data } = await apiClient.post<CreateEmployeeResponse>(
        '/employees',
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success(`Karyawan "${data.fullName}" dan akun login berhasil dibuat.`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal menambahkan data karyawan.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEmployeeDto;
    }) => {
      const { data } = await apiClient.patch<Employee>(`/employees/${id}`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(data.id) });
      toast.success(`Data karyawan "${data.fullName}" berhasil diperbarui.`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal memperbarui data karyawan.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<Employee>(`/employees/${id}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success(
        `Karyawan "${data.fullName}" berhasil dinonaktifkan (sementara).`,
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal menonaktifkan karyawan.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useTerminateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<Employee>(
        `/employees/${id}/terminate`,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.detail(data.id),
      });
      toast.success(
        `Karyawan "${data.fullName}" telah berhasil diberhentikan secara permanen (TERMINATED).`,
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal memberhentikan karyawan.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useReactivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<Employee>(
        `/employees/${id}/reactivate`,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(data.id) });
      toast.success(`Karyawan "${data.fullName}" berhasil diaktifkan kembali.`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal mengaktifkan kembali karyawan.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

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
import { useTranslations } from 'next-intl';
import { useApiError } from '@/hooks/use-api-error';

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
  const apiError = useApiError();
  const t = useTranslations('notifications');
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
      toast.success(t('employeeCreated', { name: data.fullName }));
    },
    onError: (error: any) => {
      toast.error(apiError(error, t('employeeCreateFailed')));
    },
  });
}

export function useUpdateEmployee() {
  const apiError = useApiError();
  const t = useTranslations('notifications');
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
      toast.success(t('employeeUpdated', { name: data.fullName }));
    },
    onError: (error: any) => {
      toast.error(apiError(error, t('employeeUpdateFailed')));
    },
  });
}

export function useDeleteEmployee() {
  const apiError = useApiError();
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<Employee>(`/employees/${id}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success(
        t('employeeDeactivated', { name: data.fullName }),
      );
    },
    onError: (error: any) => {
      toast.error(apiError(error, t('employeeDeactivateFailed')));
    },
  });
}

export function useTerminateEmployee() {
  const apiError = useApiError();
  const t = useTranslations('notifications');
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
        t('employeeTerminated', { name: data.fullName }),
      );
    },
    onError: (error: any) => {
      toast.error(apiError(error, t('employeeTerminateFailed')));
    },
  });
}

export function useReactivateEmployee() {
  const apiError = useApiError();
  const t = useTranslations('notifications');
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
      toast.success(t('employeeReactivated', { name: data.fullName }));
    },
    onError: (error: any) => {
      toast.error(apiError(error, t('employeeReactivateFailed')));
    },
  });
}

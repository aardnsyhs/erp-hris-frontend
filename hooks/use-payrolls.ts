import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  CreatePayrollDto,
  Payroll,
  PayrollListResponse,
  PayrollQueryParams,
  UpdatePayrollDto,
} from '@/types/payroll';
import { toast } from 'sonner';

export function usePayrolls(params?: PayrollQueryParams) {
  return useQuery({
    queryKey: queryKeys.payrolls.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PayrollListResponse>('/payrolls', {
        params: {
          limit: params?.limit ?? 10,
          page: params?.page ?? 1,
          employeeId: params?.employeeId,
          departmentId: params?.departmentId,
          status: params?.status,
          periodStart: params?.periodStart,
          periodEnd: params?.periodEnd,
        },
      });
      return data;
    },
  });
}

export function usePayroll(id: string) {
  return useQuery({
    queryKey: queryKeys.payrolls.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Payroll>(`/payrolls/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePayrollDto) => {
      const { data } = await apiClient.post<Payroll>('/payrolls', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payrolls.all });
      toast.success('Draft payroll berhasil di-generate!');
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        // Will also be handled by form error alert
        toast.error(
          'Payroll untuk karyawan ini pada periode tersebut sudah ada.',
        );
        return;
      }
      const message =
        error?.response?.data?.message || 'Gagal membuat draft payroll.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useUpdatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePayrollDto;
    }) => {
      const { data } = await apiClient.patch<Payroll>(
        `/payrolls/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payrolls.all });
      toast.success('Draft payroll berhasil diperbarui!');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal memperbarui draft payroll.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useProcessPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<Payroll>(
        `/payrolls/${id}/process`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payrolls.all });
      toast.success('Status payroll berhasil diubah ke PROCESSED!');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal memproses status payroll.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function usePayPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<Payroll>(`/payrolls/${id}/pay`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payrolls.all });
      toast.success('Status payroll berhasil diubah ke PAID (Telah Dibayar)!');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal menandai pembayaran payroll.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useDeletePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/payrolls/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payrolls.all });
      toast.success('Draft payroll berhasil dihapus.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal menghapus draft payroll.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  CreateLeaveRequestDto,
  LeaveRequest,
  LeaveRequestListResponse,
  LeaveRequestQueryParams,
  RejectLeaveRequestDto,
} from '@/types/leave-request';
import { toast } from 'sonner';

export function useLeaveRequests(params?: LeaveRequestQueryParams) {
  return useQuery({
    queryKey: queryKeys.leaveRequests.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<LeaveRequestListResponse>(
        '/leave-requests',
        {
          params: {
            limit: params?.limit ?? 10,
            page: params?.page ?? 1,
            employeeId: params?.employeeId,
            departmentId: params?.departmentId,
            status: params?.status,
            leaveType: params?.leaveType,
            startDate: params?.startDate,
            endDate: params?.endDate,
          },
        },
      );
      return data;
    },
  });
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.leaveRequests.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<LeaveRequest>(
        `/leave-requests/${id}`,
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLeaveRequestDto) => {
      const { data } = await apiClient.post<LeaveRequest>(
        '/leave-requests',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
      toast.success('Permohonan cuti berhasil diajukan!');
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error(
          'Terdapat permohonan cuti lain yang sudah disetujui (APPROVED) pada rentang tanggal tersebut.',
        );
        return;
      }
      const message =
        error?.response?.data?.message || 'Gagal mengajukan permohonan cuti.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<LeaveRequest>(
        `/leave-requests/${id}/approve`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
      toast.success('Permohonan cuti berhasil disetujui (APPROVED)!');
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error(
          'Terdapat permohonan cuti lain yang sudah disetujui (APPROVED) pada rentang tanggal yang sama.',
        );
        return;
      }
      const message =
        error?.response?.data?.message || 'Gagal menyetujui permohonan cuti.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: RejectLeaveRequestDto;
    }) => {
      const { data } = await apiClient.patch<LeaveRequest>(
        `/leave-requests/${id}/reject`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
      toast.success('Permohonan cuti berhasil ditolak (REJECTED).');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal menolak permohonan cuti.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

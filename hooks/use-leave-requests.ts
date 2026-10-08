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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('notifications');
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
      toast.success(t('leaveCreated'));
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error(
          t('leaveOverlap'),
        );
        return;
      }
      const message =
        error?.response?.data?.message || t('leaveCreateFailed');
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useApproveLeaveRequest() {
  const t = useTranslations('notifications');
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
      toast.success(t('leaveApproved'));
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error(
          t('leaveOverlap'),
        );
        return;
      }
      const message =
        error?.response?.data?.message || t('leaveApproveFailed');
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useRejectLeaveRequest() {
  const t = useTranslations('notifications');
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
      toast.success(t('leaveRejected'));
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || t('leaveRejectFailed');
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

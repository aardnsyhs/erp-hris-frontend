import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  Attendance,
  AttendanceListResponse,
  AttendanceQueryParams,
  CheckInDto,
  CheckOutDto,
} from '@/types/attendance';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useAttendances(params?: AttendanceQueryParams) {
  return useQuery({
    queryKey: queryKeys.attendances.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<AttendanceListResponse>('/attendances', {
        params: {
          limit: params?.limit ?? 10,
          page: params?.page ?? 1,
          employeeId: params?.employeeId,
          departmentId: params?.departmentId,
          status: params?.status,
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
      });
      return data;
    },
  });
}

export function useTodayAttendance(employeeId?: string | null) {
  const todayStr = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: queryKeys.attendances.list({
      today: todayStr,
      employeeId: employeeId || 'me',
    }),
    queryFn: async () => {
      const { data } = await apiClient.get<Attendance | null>(
        '/attendances/me/today',
      );
      return data;
    },
    enabled: employeeId !== null,
  });
}

export function useCheckIn() {
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CheckInDto) => {
      const { data } = await apiClient.post<Attendance>('/attendances/check-in', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendances.all });
      toast.success(t(data.status === 'LATE' ? 'checkInLate' : 'checkInOnTime'));
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || t('checkInFailed');
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useCheckOut() {
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CheckOutDto) => {
      const { data } = await apiClient.patch<Attendance>('/attendances/check-out', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendances.all });
      toast.success(t('checkOutSuccess'));
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || t('checkOutFailed');
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

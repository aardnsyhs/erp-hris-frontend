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
      const { data } = await apiClient.get<AttendanceListResponse>('/attendances', {
        params: {
          limit: 1,
          page: 1,
          startDate: todayStr,
          endDate: todayStr,
        },
      });
      return data.data[0] || null;
    },
    enabled: employeeId !== null,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CheckInDto) => {
      const { data } = await apiClient.post<Attendance>('/attendances/check-in', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendances.all });
      const statusText = data.status === 'LATE' ? ' (Terlambat)' : ' (Tepat Waktu)';
      toast.success(`Check-in berhasil tercatat${statusText}!`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal melakukan check-in.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CheckOutDto) => {
      const { data } = await apiClient.patch<Attendance>('/attendances/check-out', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendances.all });
      toast.success('Check-out berhasil tercatat. Terima kasih atas kerja keras Anda hari ini!');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal melakukan check-out.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

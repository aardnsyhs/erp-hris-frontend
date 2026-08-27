import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { UpdateWorkScheduleDto, WorkSchedule } from '@/types/work-schedule';
import { toast } from 'sonner';

export function useWorkSchedule() {
  return useQuery({
    queryKey: queryKeys.workSchedule.active,
    queryFn: async () => {
      const { data } = await apiClient.get<WorkSchedule>('/work-schedule');
      return data;
    },
  });
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateWorkScheduleDto) => {
      const { data } = await apiClient.patch<WorkSchedule>('/work-schedule', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workSchedule.active });
      toast.success(
        `Jadwal kerja berhasil diperbarui (Mulai: ${data.startTime} WIB, Toleransi: ${data.lateToleranceMinutes}m).`,
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Gagal memperbarui jadwal kerja.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

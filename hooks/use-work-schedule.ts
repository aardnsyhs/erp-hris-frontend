import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { UpdateWorkScheduleDto, WorkSchedule } from '@/types/work-schedule';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateWorkScheduleDto) => {
      const { data } = await apiClient.patch<WorkSchedule>('/work-schedule', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workSchedule.active });
      toast.success(
        t('scheduleUpdated', { time: data.startTime, minutes: data.lateToleranceMinutes }),
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || t('scheduleUpdateFailed');
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

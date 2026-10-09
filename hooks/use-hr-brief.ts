import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { HrBrief, HrBriefFilters } from '@/types/hr-brief';

export function useHrBrief(filters: HrBriefFilters, enabled = true) {
  const role = useAuthStore((state) => state.user?.role);
  return useQuery({
    queryKey: queryKeys.hrBrief.detail(filters),
    queryFn: async () =>
      (await apiClient.get<HrBrief>('/hr-brief', { params: filters })).data,
    enabled: role === 'HR_ADMIN' && enabled,
  });
}

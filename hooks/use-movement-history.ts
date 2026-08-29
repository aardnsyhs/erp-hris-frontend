import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { EmployeeMovementHistory } from '@/types/movement-history';

export function useMovementHistory(employeeId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.movementHistories.list(employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: EmployeeMovementHistory[];
      }>(`/employees/${employeeId}/movement-history`);
      return data.data;
    },
    enabled: !!employeeId && enabled,
  });
}

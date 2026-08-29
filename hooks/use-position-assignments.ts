import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  EmployeePositionAssignment,
  CreatePositionAssignmentInput,
} from '@/types/position-assignment';

export function usePositionAssignments(employeeId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.positionAssignments.list(employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: EmployeePositionAssignment[];
      }>(`/employees/${employeeId}/position-assignments`);
      return data.data;
    },
    enabled: !!employeeId && enabled,
  });
}

export function useActivePositionAssignment(
  employeeId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.positionAssignments.current(employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<EmployeePositionAssignment | null>(
        `/employees/${employeeId}/position-assignments/current`,
      );
      return data;
    },
    enabled: !!employeeId && enabled,
  });
}

export function useCreatePositionAssignment(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePositionAssignmentInput) => {
      const { data } = await apiClient.post<EmployeePositionAssignment>(
        `/employees/${employeeId}/position-assignments`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.positionAssignments.list(employeeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.positionAssignments.current(employeeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.movementHistories.list(employeeId),
      });
    },
  });
}

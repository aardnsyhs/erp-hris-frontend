import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  EmployeeReportingLine,
  CreateReportingLineInput,
} from '@/types/reporting-line';

export function useReportingLines(employeeId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reportingLines.list(employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: EmployeeReportingLine[];
      }>(`/employees/${employeeId}/reporting-lines`);
      return data.data;
    },
    enabled: !!employeeId && enabled,
  });
}

export function useActiveReportingLine(employeeId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reportingLines.current(employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<EmployeeReportingLine | null>(
        `/employees/${employeeId}/reporting-lines/current`,
      );
      return data;
    },
    enabled: !!employeeId && enabled,
  });
}

export function useCreateReportingLine(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReportingLineInput) => {
      const { data } = await apiClient.post<EmployeeReportingLine>(
        `/employees/${employeeId}/reporting-lines`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reportingLines.list(employeeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reportingLines.current(employeeId),
      });
    },
  });
}

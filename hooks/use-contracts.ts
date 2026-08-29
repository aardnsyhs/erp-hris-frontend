import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  EmploymentContract,
  CreateContractInput,
  UpdateContractStatusInput,
} from '@/types/contract';

export function useContracts(employeeId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.contracts.list(employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: EmploymentContract[] }>(
        `/employees/${employeeId}/contracts`,
      );
      return data.data;
    },
    enabled: !!employeeId && enabled,
  });
}

export function useCreateContract(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateContractInput) => {
      const { data } = await apiClient.post<EmploymentContract>(
        `/employees/${employeeId}/contracts`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contracts.list(employeeId),
      });
    },
  });
}

export function useUpdateContractStatus(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateContractStatusInput;
    }) => {
      const { data } = await apiClient.patch<EmploymentContract>(
        `/employees/${employeeId}/contracts/${id}/status`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contracts.list(employeeId),
      });
    },
  });
}

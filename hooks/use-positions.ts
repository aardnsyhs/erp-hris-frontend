import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  Position,
  CreatePositionInput,
  UpdatePositionInput,
  PositionQuery,
} from '@/types/position';

export function usePositions(query?: PositionQuery) {
  return useQuery({
    queryKey: queryKeys.positions.list(query),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Position[] }>('/positions', {
        params: query,
      });
      return data.data;
    },
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePositionInput) => {
      const { data } = await apiClient.post<Position>('/positions', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.positions.all,
      });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePositionInput;
    }) => {
      const { data } = await apiClient.patch<Position>(
        `/positions/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.positions.all,
      });
    },
  });
}

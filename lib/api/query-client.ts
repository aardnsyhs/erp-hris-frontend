import { MutationCache, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-keys';

export function createQueryClient() {
  const client: QueryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.hrBrief.all }),
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute fresh data
        gcTime: 5 * 60 * 1000, // 5 minutes cache retention
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
  return client;
}

export const queryClient = createQueryClient();

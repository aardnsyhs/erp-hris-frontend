import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  AuditLog,
  AuditLogListResponse,
  AuditLogQueryParams,
} from '@/types/audit-log';

export function useAuditLogs(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<AuditLogListResponse>('/audit-logs', {
        params: {
          limit: params?.limit ?? 10,
          page: params?.page ?? 1,
          entity: params?.entity || undefined,
          action: params?.action || undefined,
          actorId: params?.actorId || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
      });
      return data;
    },
  });
}

export function useAuditLog(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.auditLogs.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
      return data;
    },
    enabled: !!id && enabled,
  });
}

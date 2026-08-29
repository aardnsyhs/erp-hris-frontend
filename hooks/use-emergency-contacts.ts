import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  CreateEmergencyContactInput,
  EmergencyContact,
  UpdateEmergencyContactInput,
} from '@/types/emergency-contact';

export function useEmergencyContacts(employeeId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.emergencyContacts.list(employeeId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: EmergencyContact[] }>(
        `/employees/${employeeId}/emergency-contacts`,
      );
      return data.data;
    },
    enabled: !!employeeId && enabled,
  });
}

export function useCreateEmergencyContact(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEmergencyContactInput) => {
      const { data } = await apiClient.post<EmergencyContact>(
        `/employees/${employeeId}/emergency-contacts`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emergencyContacts.list(employeeId),
      });
    },
  });
}

export function useUpdateEmergencyContact(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateEmergencyContactInput;
    }) => {
      const { data } = await apiClient.patch<EmergencyContact>(
        `/employees/${employeeId}/emergency-contacts/${id}`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emergencyContacts.list(employeeId),
      });
    },
  });
}

export function useDeleteEmergencyContact(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<{ message: string }>(
        `/employees/${employeeId}/emergency-contacts/${id}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emergencyContacts.list(employeeId),
      });
    },
  });
}

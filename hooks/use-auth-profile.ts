import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { AuthUser, ChangePasswordDto } from '@/types/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useApiError } from '@/hooks/use-api-error';

export const authKeys = {
  profile: ['auth', 'profile'] as const,
};

export function useUserProfile() {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const { data } = await apiClient.get<AuthUser>('/auth/me');
      if (data) {
        setUser(data);
      }
      return data;
    },
  });
}

export function useChangePassword() {
  const apiError = useApiError();
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ChangePasswordDto) => {
      const { data } = await apiClient.patch<{ message: string }>(
        '/auth/change-password',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      toast.success(t('passwordUpdated'));
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
    onError: (error: any) => {
      toast.error(apiError(error, t('passwordUpdateFailed')));
    },
  });
}

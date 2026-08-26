'use client';

import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/api/query-client';
import { apiClient } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/auth-store';
import { AuthUser, RefreshResponse } from '@/types/auth';
import { Toaster } from '@/components/ui/sonner';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  // Initial Auth Hydration via refresh token cookie & me endpoint
  useEffect(() => {
    let isMounted = true;

    async function hydrateAuth() {
      try {
        setLoading(true);
        // Attempt silent refresh
        const refreshRes = await apiClient.post<RefreshResponse>('/auth/refresh');
        const token = refreshRes.data.accessToken;

        // Fetch user profile with new access token
        const meRes = await apiClient.get<AuthUser>('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) {
          setAuth(meRes.data, token);
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

function AuthGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const searchStr = searchParams?.toString();
      const target = `${pathname}${searchStr ? `?${searchStr}` : ''}`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname, searchParams]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono font-bold text-xs shadow-xs animate-pulse">
            HR
          </div>
          <span className="text-xs font-mono text-muted-foreground animate-pulse">
            Memuat sesi...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthGuardInner>{children}</AuthGuardInner>
    </Suspense>
  );
}

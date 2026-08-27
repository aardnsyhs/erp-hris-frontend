import React from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AuthGuard } from '@/components/layout/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Console Sidebar */}
        <AppSidebar />

        {/* Main Operations Container */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-5">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

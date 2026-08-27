import React from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main App Container */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

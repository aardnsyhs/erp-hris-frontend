'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Briefcase,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/auth';

interface NavConfig {
  key: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

const navConfigs: NavConfig[] = [
  {
    key: 'dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    key: 'employees',
    href: '/employees',
    icon: Users,
    roles: ['HR_ADMIN', 'MANAGER'],
  },
  {
    key: 'positions',
    href: '/positions',
    icon: Briefcase,
    roles: ['HR_ADMIN'],
  },
  {
    key: 'departments',
    href: '/departments',
    icon: Building2,
    roles: ['HR_ADMIN'],
  },
  {
    key: 'attendance',
    href: '/attendances',
    icon: CalendarCheck2,
    roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    key: 'leaveRequests',
    href: '/leave-requests',
    icon: CalendarDays,
    roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    key: 'payroll',
    href: '/payrolls',
    icon: CreditCard,
    roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    key: 'auditLogs',
    href: '/audit-logs',
    icon: ShieldCheck,
    roles: ['HR_ADMIN'],
  },
  {
    key: 'profile',
    href: '/profile',
    icon: User,
    roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
];

export function SidebarNavContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const user = useAuthStore((state) => state.user);
  const currentRole = user?.role || 'EMPLOYEE';

  const filteredNavItems = navConfigs.filter((item) =>
    item.roles.includes(currentRole as UserRole),
  );

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border select-none">
      {/* Console Brand Header */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-sidebar-border shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono font-bold text-xs shadow-xs tracking-wider">
          HR
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-xs tracking-wider uppercase text-foreground truncate font-mono">
            {t('systemTitle')}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono truncate">
            {currentRole.replace('_', ' ')} CONSOLE
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest font-mono">
          Operations
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-md transition-colors relative',
                isActive
                  ? 'bg-sidebar-accent text-foreground font-semibold border-l-2 border-primary pl-2'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              <span className="truncate">{t(item.key as any)}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Operator User Footer */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-mono font-bold text-xs">
            {user?.employee?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-foreground truncate">
              {user?.employee?.fullName || user?.email || 'User'}
            </span>
            <span className="text-[10px] text-muted-foreground truncate font-mono">
              {user?.employee?.nip || user?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-60 border-r border-border bg-sidebar flex-col h-screen shrink-0 sticky top-0">
      <SidebarNavContent />
    </aside>
  );
}

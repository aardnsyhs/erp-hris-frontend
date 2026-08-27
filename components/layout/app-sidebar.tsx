'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Building2,
  CalendarCheck2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  User,
  Users,
  BriefcaseBusiness,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Badge } from '@/components/ui/badge';
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
    key: 'departments',
    href: '/departments',
    icon: Building2,
    roles: ['HR_ADMIN'],
  },
  {
    key: 'employees',
    href: '/employees',
    icon: Users,
    roles: ['HR_ADMIN', 'MANAGER'],
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
    <div className="flex flex-col h-full bg-card text-card-foreground">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs font-bold text-lg">
          <BriefcaseBusiness className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-base tracking-tight text-foreground truncate">
            {t('systemTitle')}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium truncate">
            {t('systemSubtitle')}
          </span>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-6 py-3.5 border-b border-border/70 bg-muted/40 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Role:
          </span>
          <Badge
            variant={
              currentRole === 'HR_ADMIN'
                ? 'default'
                : currentRole === 'MANAGER'
                ? 'secondary'
                : 'outline'
            }
            className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5"
          >
            {currentRole.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span className="truncate">{t(item.key as any)}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded-md font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Summary */}
      <div className="p-4 border-t border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {user?.employee?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-foreground truncate">
              {user?.employee?.fullName || user?.email || 'User'}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {user?.employee?.jobTitle || user?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col h-screen shrink-0">
      <SidebarNavContent />
    </aside>
  );
}

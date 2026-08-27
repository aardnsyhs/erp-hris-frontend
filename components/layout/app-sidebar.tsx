'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    title: 'Departemen',
    href: '/departments',
    icon: Building2,
    roles: ['HR_ADMIN'],
  },
  {
    title: 'Karyawan',
    href: '/employees',
    icon: Users,
    roles: ['HR_ADMIN', 'MANAGER'],
  },
  {
    title: 'Absensi',
    href: '/attendances',
    icon: CalendarCheck2,
    roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    title: 'Cuti & Izin',
    href: '/leave-requests',
    icon: CalendarDays,
    roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    title: 'Payroll',
    href: '/payrolls',
    icon: CreditCard,
    roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    title: 'Profil Saya',
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
  const user = useAuthStore((state) => state.user);
  const currentRole = user?.role || 'EMPLOYEE';

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(currentRole as UserRole),
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold text-lg">
          <BriefcaseBusiness className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white">
            HRIS Core
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">
            Enterprise Portal
          </span>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-800/20 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Peran Aktif:
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
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100',
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-neutral-400 dark:text-neutral-500',
                )}
              />
              <span>{item.title}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded-md font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Summary */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 flex items-center justify-center font-bold text-xs">
            {user?.employee?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {user?.employee?.fullName || user?.email || 'Pengguna'}
            </span>
            <span className="text-[11px] text-neutral-400 truncate">
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
    <aside className="hidden md:flex w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-col h-screen shrink-0">
      <SidebarNavContent />
    </aside>
  );
}

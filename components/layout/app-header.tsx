'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LogOut,
  Menu,
  Shield,
  User,
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CreditCard,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const tNav = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const userInitials =
    user?.employee?.fullName
      ? user.employee.fullName
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="h-16 border-b border-border bg-card text-card-foreground flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors">
      {/* Left Title / Mobile Hamburger + Context */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={tNav('expandSidebar')}
                  className="h-9 w-9 cursor-pointer"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent
              side="left"
              className="p-0 w-72 sm:w-80 border-r border-border"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>{tNav('menuAction')}</SheetTitle>
              </SheetHeader>
              <SidebarNavContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        <h1 className="text-sm font-semibold text-foreground truncate">
          {tNav('systemTitle')} – {tNav('systemSubtitle')}
        </h1>
      </div>

      {/* Right User & Utility Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle (Light / Dark / System) */}
        <ThemeToggle />

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={tNav('menuAction')}
            className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-muted focus:outline-hidden transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
              {userInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left mr-1">
              <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-32">
                {user?.employee?.fullName || user?.email}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono">
                {user?.role}
              </span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-bold leading-none text-foreground truncate">
                    {user?.employee?.fullName || 'Akun Pengguna'}
                  </p>
                  <p className="text-[11px] leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <div className="pt-1.5 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      <Shield className="w-2.5 h-2.5 mr-1" />
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => router.push('/profile')}
                className="cursor-pointer text-xs flex items-center gap-2"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{tNav('profile')}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{tNav('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function SidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const tNav = useTranslations('navigation');
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const navItems = [
    { href: '/', label: tNav('dashboard'), icon: LayoutDashboard, roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { href: '/employees', label: tNav('employees'), icon: Users, roles: ['HR_ADMIN', 'MANAGER'] },
    { href: '/departments', label: tNav('departments'), icon: Building2, roles: ['HR_ADMIN', 'MANAGER'] },
    { href: '/attendances', label: tNav('attendance'), icon: CalendarCheck2, roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { href: '/leave-requests', label: tNav('leaveRequests'), icon: CalendarDays, roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { href: '/payrolls', label: tNav('payroll'), icon: CreditCard, roles: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
  ];

  const filteredNav = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role)),
  );

  return (
    <div className="flex flex-col h-full bg-card text-foreground">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-xs">
          HR
        </div>
        <div>
          <div className="font-bold text-sm text-foreground">{tNav('systemTitle')}</div>
          <div className="text-[11px] text-muted-foreground">{tNav('systemSubtitle')}</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
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
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

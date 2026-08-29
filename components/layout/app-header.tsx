'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LogOut,
  Menu,
  Shield,
  User,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/axios';
import { useQueryClient } from '@tanstack/react-query';
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
import { SidebarNavContent } from './app-sidebar';

export function AppHeader() {
  const tNav = useTranslations('navigation');
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Gracefully proceed with client-side cleanup if network or session already expired
    } finally {
      clearAuth();
      queryClient.clear();
      router.replace('/login');
      router.refresh();
    }
  };

  const getPageTitle = () => {
    if (pathname === '/') return tNav('dashboard');
    if (pathname.startsWith('/employees')) return tNav('employees');
    if (pathname.startsWith('/positions')) return tNav('positions');
    if (pathname.startsWith('/departments')) return tNav('departments');
    if (pathname.startsWith('/attendances')) return tNav('attendance');
    if (pathname.startsWith('/leave-requests')) return tNav('leaveRequests');
    if (pathname.startsWith('/payrolls')) return tNav('payroll');
    if (pathname.startsWith('/audit-logs')) return tNav('auditLogs');
    if (pathname.startsWith('/profile')) return tNav('profile');
    return tNav('dashboard');
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
    <header className="h-14 border-b border-border bg-card text-card-foreground flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30">
      {/* Left: Mobile Nav Drawer & Context Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={tNav('expandSidebar')}
                  className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              }
            />
            <SheetContent
              side="left"
              className="p-0 w-64 border-r border-border"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>{tNav('menuAction')}</SheetTitle>
              </SheetHeader>
              <SidebarNavContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Minimal Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <span className="hidden sm:inline-block font-medium">Console</span>
          <ChevronRight className="hidden sm:inline-block w-3 h-3 text-muted-foreground/60" />
          <span className="font-semibold text-foreground tracking-tight">{getPageTitle()}</span>
        </nav>
      </div>

      {/* Right: Console Controls (Locale, Theme, Profile) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle (Light / Dark / System) */}
        <ThemeToggle />

        {/* Operator Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={tNav('menuAction')}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-muted focus:outline-hidden transition-colors cursor-pointer ml-1 border border-border/80"
          >
            <div className="w-6.5 h-6.5 rounded bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-[11px]">
              {userInitials}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-foreground max-w-28 truncate">
              {user?.employee?.fullName || user?.email}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 font-sans">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-bold leading-none text-foreground truncate">
                    {user?.employee?.fullName || 'User Account'}
                  </p>
                  <p className="text-[11px] font-mono leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <div className="pt-1.5 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
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
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{tNav('profile')}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{tNav('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

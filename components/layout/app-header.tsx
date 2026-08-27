'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LogOut, User as UserIcon, Shield, Menu } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/axios';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarNavContent } from '@/components/layout/app-sidebar';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { toast } from 'sonner';

export function AppHeader() {
  const router = useRouter();
  const tNav = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const { user, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Continue clearing local state regardless of server logout response
    } finally {
      clearAuth();
      setMobileOpen(false);
      toast.success(tNav('logout'));
      router.push('/login');
    }
  };

  const initials =
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <SheetTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={tNav('expandSidebar')}
                          className="h-9 w-9 cursor-pointer"
                        />
                      }
                    />
                  }
                >
                  <Menu className="h-5 w-5" />
                </TooltipTrigger>
                <TooltipContent side="bottom">{tNav('expandSidebar')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

        <div className="h-4 w-px bg-border mx-0.5" />

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={tNav('menuAction')}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer outline-none"
          >
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-none">
                {user?.employee?.fullName || user?.email || 'User'}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.employee?.fullName || tNav('profile')}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-primary font-medium">
                    <Shield className="w-3 h-3" />
                    <span>Role: {user?.role}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/profile')}
                className="cursor-pointer"
              >
                <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{tNav('profile')}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive cursor-pointer focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{tNav('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

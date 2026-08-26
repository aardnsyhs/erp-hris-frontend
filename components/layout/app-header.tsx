'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export function AppHeader() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Continue clearing local state regardless of server logout response
    } finally {
      clearAuth();
      toast.success('Anda telah berhasil keluar (logout)');
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
    <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-6 shrink-0">
      {/* Left Title / Breadcrumb context */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Sistem Informasi Manajemen SDM & Penggajian
        </h1>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer outline-none">
            <Avatar className="h-8 w-8 border border-neutral-200 dark:border-neutral-700">
              <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-none">
                {user?.employee?.fullName || user?.email || 'User'}
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {user?.employee?.fullName || 'Akun Pengguna'}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-600 font-medium">
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
              <UserIcon className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Profil Pengguna</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar (Logout)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

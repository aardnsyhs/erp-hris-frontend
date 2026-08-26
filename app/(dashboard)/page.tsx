'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  CalendarCheck2,
  CalendarDays,
  CreditCard,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || 'EMPLOYEE';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Selamat Datang Kembali
            </span>
            <Badge variant="secondary" className="bg-white text-blue-800 text-xs font-bold uppercase">
              {role.replace('_', ' ')}
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {user?.employee?.fullName || user?.email || 'Rekan Kerja'}
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            {user?.employee?.jobTitle ? `${user.employee.jobTitle} • ` : ''}
            Kelola operasional SDM, absensi harian, pengajuan cuti, dan slip gaji dalam satu portal terintegrasi.
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Modul & Navigasi Cepat
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Departemen Card (HR_ADMIN only) */}
          {role === 'HR_ADMIN' && (
            <Card className="hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Struktur Organisasi</CardTitle>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>
                  Kelola data departemen, kode divisi, dan dependensi kepegawaian.
                </CardDescription>
                <Link
                  href="/departments"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-between')}
                >
                  Buka Departemen <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Karyawan Card (HR_ADMIN & MANAGER) */}
          {(role === 'HR_ADMIN' || role === 'MANAGER') && (
            <Card className="hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">
                  {role === 'HR_ADMIN' ? 'Direktori Karyawan' : 'Anggota Tim'}
                </CardTitle>
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>
                  {role === 'HR_ADMIN'
                    ? 'Manajemen data profil karyawan, gaji pokok, dan status aktif.'
                    : 'Pantau daftar anggota tim di departemen Anda.'}
                </CardDescription>
                <Link
                  href="/employees"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-between')}
                >
                  Buka Data Karyawan <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Absensi Card (All Roles) */}
          <Card className="hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Absensi Kehadiran</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription>
                {role === 'EMPLOYEE'
                  ? 'Catat check-in & check-out harian dan lihat rekap absensi Anda.'
                  : 'Pantau rekapitulasi kehadiran dan ketepatan waktu kerja tim.'}
              </CardDescription>
              <Link
                href="/attendances"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-between')}
              >
                Buka Absensi <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>

          {/* Cuti Card (All Roles) */}
          <Card className="hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Pengajuan & Izin Cuti</CardTitle>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                <CalendarDays className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription>
                {role === 'EMPLOYEE'
                  ? 'Ajukan permohonan cuti tahunan, sakit, atau izin pribadi.'
                  : 'Tinjau dan setujui / tolak permohonan cuti anggota tim.'}
              </CardDescription>
              <Link
                href="/leave-requests"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-between')}
              >
                Buka Permohonan Cuti <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>

          {/* Payroll Card (All Roles) */}
          <Card className="hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Penggajian & Slip Gaji</CardTitle>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
                <CreditCard className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription>
                {role === 'HR_ADMIN'
                  ? 'Generate draft payroll bulanan, proses pembayaran, dan monitoring.'
                  : role === 'MANAGER'
                  ? 'Pantau status pembayaran tim dan lihat slip gaji pribadi.'
                  : 'Lihat rincian slip gaji dan riwayat pembayaran bulanan Anda.'}
              </CardDescription>
              <Link
                href="/payrolls"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-between')}
              >
                Buka Payroll <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

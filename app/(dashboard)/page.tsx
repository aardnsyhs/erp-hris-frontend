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
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  UserCheck,
  UserX,
  FileText,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEmployees } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import { useLeaveRequests } from '@/hooks/use-leave-requests';
import { usePayrolls } from '@/hooks/use-payrolls';
import { useAttendances } from '@/hooks/use-attendance';
import { AttendanceWidget } from '@/components/attendance/attendance-widget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || 'EMPLOYEE';
  const emp = user?.employee;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
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
            {emp?.fullName || user?.email || 'Rekan Kerja'}
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            {emp?.jobTitle ? `${emp.jobTitle} • ` : ''}
            {emp?.department?.name ? `${emp.department.name} • ` : ''}
            Kelola operasional SDM, absensi harian, pengajuan cuti, dan penggajian dalam satu portal terintegrasi.
          </p>
        </div>
      </div>

      {/* Role-Specific Dashboard Views */}
      {role === 'HR_ADMIN' && <HRAdminDashboard />}
      {role === 'MANAGER' && <ManagerDashboard departmentId={emp?.departmentId} />}
      {role === 'EMPLOYEE' && <EmployeeDashboard employeeId={emp?.id} />}
    </div>
  );
}

// -------------------------------------------------------------
// 1. HR ADMINISTRATOR DASHBOARD
// -------------------------------------------------------------
function HRAdminDashboard() {
  const { data: employeesData, isLoading: loadingEmployees } = useEmployees({
    status: 'ACTIVE',
    limit: 1,
  });
  const { data: leavesData, isLoading: loadingLeaves } = useLeaveRequests({
    status: 'PENDING',
    limit: 1,
  });
  const { data: payrollsData, isLoading: loadingPayrolls } = usePayrolls({
    status: 'DRAFT',
    limit: 1,
  });
  const { data: departmentsData, isLoading: loadingDepartments } = useDepartments();

  const totalActiveEmployees = employeesData?.meta?.total ?? 0;
  const pendingLeaves = leavesData?.meta?.total ?? 0;
  const draftPayrolls = payrollsData?.meta?.total ?? 0;
  const departments = departmentsData?.data || [];

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Karyawan Aktif */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-neutral-500">Karyawan Aktif</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {loadingEmployees ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              ) : (
                totalActiveEmployees
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Status aktif di seluruh divisi</p>
            <Link
              href="/employees"
              className="text-xs text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              Lihat Direktori <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 2: Cuti Pending */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-neutral-500">Cuti Menunggu</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {loadingLeaves ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              ) : (
                pendingLeaves
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Menunggu persetujuan HR/Manager</p>
            <Link
              href="/leave-requests"
              className="text-xs text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              Tinjau Cuti <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 3: Payroll Draft */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-neutral-500">Payroll Draft</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {loadingPayrolls ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              ) : (
                draftPayrolls
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Belum diproses ke pembayaran</p>
            <Link
              href="/payrolls"
              className="text-xs text-purple-600 dark:text-purple-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              Proses Payroll <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 4: Total Departemen */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-neutral-500">Departemen</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {loadingDepartments ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              ) : (
                departments.length
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Unit kerja terdaftar</p>
            <Link
              href="/departments"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              Kelola Departemen <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Ringkasan Departemen & Modul Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Struktur Departemen Organisasi</CardTitle>
              <CardDescription className="text-xs">
                Daftar unit divisi dan alokasi karyawan aktif di perusahaan.
              </CardDescription>
            </div>
            <Link
              href="/departments"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8')}
            >
              Lihat Semua
            </Link>
          </CardHeader>
          <CardContent>
            {loadingDepartments ? (
              <div className="py-8 flex items-center justify-center text-xs text-neutral-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memuat departemen...
              </div>
            ) : departments.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">Belum ada departemen terdaftar.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                          {dept.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                          {dept.code}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        {dept._count?.employees ?? 0} Karyawan Terdaftar
                      </p>
                    </div>
                    <Link
                      href={`/employees?departmentId=${dept.id}`}
                      aria-label={`Lihat karyawan departemen ${dept.name}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Nav Card */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Aksi Cepat Administrator</CardTitle>
            <CardDescription className="text-xs">Pintasan modul pengelolaan utama.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Link
              href="/employees"
              className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4 text-blue-600" />
                Tambah & Kelola Karyawan
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link
              href="/leave-requests"
              className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <CalendarDays className="w-4 h-4 text-amber-600" />
                Persetujuan Pengajuan Cuti
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link
              href="/payrolls"
              className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <CreditCard className="w-4 h-4 text-purple-600" />
                Generate & Bayar Payroll
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link
              href="/attendances"
              className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                Rekapitulasi Absensi Kerja
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. MANAGER DASHBOARD
// -------------------------------------------------------------
function ManagerDashboard({ departmentId }: { departmentId?: string | null }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: teamEmployees, isLoading: loadingTeam } = useEmployees({
    departmentId: departmentId || undefined,
    status: 'ACTIVE',
    limit: 1,
  });

  const { data: teamLeaves, isLoading: loadingLeaves } = useLeaveRequests({
    departmentId: departmentId || undefined,
    status: 'PENDING',
    limit: 5,
  });

  const { data: todayAttendances, isLoading: loadingAttendance } = useAttendances({
    departmentId: departmentId || undefined,
    startDate: todayStr,
    endDate: todayStr,
    limit: 100,
  });

  const totalTeamMembers = teamEmployees?.meta?.total ?? 0;
  const pendingTeamLeaves = teamLeaves?.meta?.total ?? 0;
  const attendanceList = todayAttendances?.data || [];

  const presentCount = attendanceList.filter((a) => a.status === 'PRESENT').length;
  const lateCount = attendanceList.filter((a) => a.status === 'LATE').length;
  const absentCount = attendanceList.filter((a) => a.status === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Anggota Tim */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-neutral-500">Anggota Tim Aktif</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {loadingTeam ? <Loader2 className="w-5 h-5 animate-spin" /> : totalTeamMembers}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Karyawan dalam departemen Anda</p>
            <Link
              href="/employees"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              Lihat Anggota Tim <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 2: Cuti Perlu Di-approve */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-neutral-500">Cuti Perlu Review</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {loadingLeaves ? <Loader2 className="w-5 h-5 animate-spin" /> : pendingTeamLeaves}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Menunggu persetujuan Anda</p>
            <Link
              href="/leave-requests"
              className="text-xs text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              Proses Persetujuan <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 3: Kehadiran Tim Hari Ini */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-neutral-500">Absensi Tim Hari Ini</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {loadingAttendance ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `${presentCount + lateCount} / ${totalTeamMembers}`
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Anggota tim sudah check-in hari ini</p>
            <Link
              href="/attendances"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              Rekap Kehadiran <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Absensi & List Cuti Pending Tim */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Ringkasan Kehadiran Tim Hari Ini</CardTitle>
            <CardDescription className="text-xs">
              Distribusi status kehadiran anggota tim pada {todayStr}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900">
                <div className="flex items-center justify-center text-emerald-600 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">
                  Tepat Waktu
                </span>
                <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  {presentCount}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900">
                <div className="flex items-center justify-center text-amber-600 mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 block">
                  Terlambat
                </span>
                <span className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  {lateCount}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900">
                <div className="flex items-center justify-center text-red-600 mb-1">
                  <XCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-red-700 dark:text-red-300 block">
                  Tidak Hadir
                </span>
                <span className="text-lg font-bold text-red-900 dark:text-red-100">
                  {absentCount}
                </span>
              </div>
            </div>

            <Link
              href="/attendances"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full text-xs')}
            >
              Buka Rekapitulasi Absensi Lengkap
            </Link>
          </CardContent>
        </Card>

        {/* Permohonan Cuti Tim Menunggu Persetujuan */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Pengajuan Cuti Tim Menunggu</CardTitle>
              <CardDescription className="text-xs">
                Daftar permohonan cuti yang membutuhkan persetujuan Anda.
              </CardDescription>
            </div>
            <Link
              href="/leave-requests"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8')}
            >
              Lihat Semua
            </Link>
          </CardHeader>
          <CardContent>
            {loadingLeaves ? (
              <div className="py-6 flex items-center justify-center text-xs text-neutral-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memuat data cuti...
              </div>
            ) : (teamLeaves?.data || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                Semua permohonan cuti tim sudah selesai ditinjau.
              </div>
            ) : (
              <div className="space-y-2.5">
                {(teamLeaves?.data || []).slice(0, 3).map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {leave.employee?.fullName}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        {leave.leaveType} • {new Date(leave.startDate).toLocaleDateString('id-ID')} s/d{' '}
                        {new Date(leave.endDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px]">
                      PENDING
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. EMPLOYEE DASHBOARD
// -------------------------------------------------------------
function EmployeeDashboard({ employeeId }: { employeeId?: string | null }) {
  const { data: recentLeaves, isLoading: loadingLeaves } = useLeaveRequests({
    employeeId: employeeId || undefined,
    limit: 3,
  });

  const { data: recentPayroll, isLoading: loadingPayroll } = usePayrolls({
    employeeId: employeeId || undefined,
    status: 'PAID',
    limit: 1,
  });

  const lastPayroll = recentPayroll?.data?.[0];

  const formatRupiah = (val?: string | number | null) => {
    if (val === undefined || val === null) return '-';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-6">
      {/* Attendance Widget Hari Ini (Reusable Widget) */}
      <AttendanceWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: Riwayat Permohonan Cuti Terbaru */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Status Pengajuan Cuti Terbaru</CardTitle>
              <CardDescription className="text-xs">
                Pantau proses verifikasi permohonan cuti Anda.
              </CardDescription>
            </div>
            <Link
              href="/leave-requests"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8')}
            >
              Ajukan Cuti
            </Link>
          </CardHeader>
          <CardContent>
            {loadingLeaves ? (
              <div className="py-6 flex items-center justify-center text-xs text-neutral-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memuat riwayat cuti...
              </div>
            ) : (recentLeaves?.data || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                Belum ada permohonan cuti yang diajukan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {(recentLeaves?.data || []).map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {leave.leaveType === 'ANNUAL'
                          ? 'Cuti Tahunan'
                          : leave.leaveType === 'SICK'
                          ? 'Cuti Sakit'
                          : leave.leaveType === 'MATERNITY'
                          ? 'Cuti Melahirkan'
                          : 'Cuti Tanpa Gaji'}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {formatDate(leave.startDate)} s/d {formatDate(leave.endDate)}
                      </p>
                    </div>
                    {leave.status === 'APPROVED' ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                        Disetujui
                      </Badge>
                    ) : leave.status === 'REJECTED' ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Ditolak
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px]">
                        Menunggu
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Widget 2: Ringkasan Slip Gaji Terakhir */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Slip Gaji Terakhir (Terbayar)</CardTitle>
              <CardDescription className="text-xs">
                Informasi penerimaan gaji periode terakhir yang telah disalurkan.
              </CardDescription>
            </div>
            <Link
              href="/payrolls"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8')}
            >
              Lihat Riwayat
            </Link>
          </CardHeader>
          <CardContent>
            {loadingPayroll ? (
              <div className="py-6 flex items-center justify-center text-xs text-neutral-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memuat slip gaji...
              </div>
            ) : !lastPayroll ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                Belum ada slip gaji berstatus dibayar (PAID).
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-500">Periode Gaji:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatDate(lastPayroll.periodStart)} - {formatDate(lastPayroll.periodEnd)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-500">Status Pembayaran:</span>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                    PAID (Terbayar)
                  </Badge>
                </div>

                {lastPayroll.netSalary !== undefined && (
                  <div className="pt-2 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      Gaji Bersih (Net Salary):
                    </span>
                    <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {formatRupiah(lastPayroll.netSalary)}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/payrolls"
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full text-xs')}
                  >
                    Buka Slip Gaji Lengkap
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

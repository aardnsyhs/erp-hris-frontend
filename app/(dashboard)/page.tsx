'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
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
import { Progress } from '@/components/ui/progress';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const user = useAuthStore((state) => state.user);
  const role = user?.role || 'EMPLOYEE';
  const emp = user?.employee;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-linear-to-r from-primary via-indigo-600 to-primary text-primary-foreground shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 text-white">
              <Sparkles className="w-3.5 h-3.5" />
              {t('welcomeBack')}
            </span>
            <Badge variant="secondary" className="bg-white text-primary text-xs font-bold uppercase">
              {role.replace('_', ' ')}
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {emp?.fullName || user?.email || 'User'}
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            {emp?.jobTitle ? `${emp.jobTitle} • ` : ''}
            {emp?.department?.name ? `${emp.department.name} • ` : ''}
            {t('welcomeDesc')}
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
  const t = useTranslations('dashboard');
  const tEmp = useTranslations('employees');
  const tLeave = useTranslations('leave');
  const tPayroll = useTranslations('payroll');
  const tDept = useTranslations('departments');
  const tAtt = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const todayStr = new Date().toISOString().split('T')[0];

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
  const { data: attendancesData, isLoading: loadingAttendance } = useAttendances({
    startDate: todayStr,
    endDate: todayStr,
    limit: 100,
  });

  const totalActiveEmployees = employeesData?.meta?.total ?? 0;
  const pendingLeaves = leavesData?.meta?.total ?? 0;
  const draftPayrolls = payrollsData?.meta?.total ?? 0;
  const departments = departmentsData?.data || [];

  const attendanceList = attendancesData?.data || [];
  const presentCount = attendanceList.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LATE',
  ).length;
  const attendancePercentage =
    totalActiveEmployees > 0
      ? Math.round((presentCount / totalActiveEmployees) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Karyawan Aktif */}
        <Card className="border-border bg-card shadow-2xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">{t('activeEmployees')}</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loadingEmployees ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                totalActiveEmployees
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{t('activeEmployeesDesc')}</p>
            <Link
              href="/employees"
              className="text-xs text-primary font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              {t('viewDirectory')} <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 2: Cuti Pending */}
        <Card className="border-border bg-card shadow-2xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">{t('pendingLeaves')}</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loadingLeaves ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                pendingLeaves
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{t('pendingLeavesDesc')}</p>
            <Link
              href="/leave-requests"
              className="text-xs text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              {t('reviewLeaves')} <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 3: Payroll Draft */}
        <Card className="border-border bg-card shadow-2xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">{t('draftPayroll')}</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loadingPayrolls ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                draftPayrolls
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{t('draftPayrollDesc')}</p>
            <Link
              href="/payrolls"
              className="text-xs text-purple-600 dark:text-purple-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              {t('processPayroll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 4: Total Departemen */}
        <Card className="border-border bg-card shadow-2xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">{t('totalDepartments')}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loadingDepartments ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                departments.length
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{t('totalDepartmentsDesc')}</p>
            <Link
              href="/departments"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              {t('manageDepartments')} <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Kehadiran Karyawan Hari Ini */}
      <Card className="border-border bg-card shadow-2xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <CalendarCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t('todayAttendanceRate')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('todayAttendanceDesc', { date: todayStr })}
            </CardDescription>
          </div>
          <Link
            href="/attendances"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8')}
          >
            {t('viewRecap')}
          </Link>
        </CardHeader>
        <CardContent>
          {loadingAttendance || loadingEmployees ? (
            <div className="py-4 flex items-center justify-center text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {tCommon('loading')}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {presentCount} / {totalActiveEmployees} ({attendancePercentage}%)
                </span>
                <span className="font-bold text-foreground">
                  {attendancePercentage}%
                </span>
              </div>
              <Progress
                value={attendancePercentage}
                aria-label={`Tingkat kehadiran karyawan hari ini ${attendancePercentage}%`}
                className="h-2.5 w-full bg-muted"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ringkasan Departemen & Modul Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border bg-card shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">{t('departmentStructure')}</CardTitle>
              <CardDescription className="text-xs">
                {t('departmentStructureDesc')}
              </CardDescription>
            </div>
            <Link
              href="/departments"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8')}
            >
              {tCommon('viewAll')}
            </Link>
          </CardHeader>
          <CardContent>
            {loadingDepartments ? (
              <div className="py-8 flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tCommon('loading')}
              </div>
            ) : departments.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">{t('noDepartmentsFound')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground">
                          {dept.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                          {dept.code}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {dept._count?.employees ?? 0} {tEmp('title')}
                      </p>
                    </div>
                    <Link
                      href={`/employees?departmentId=${dept.id}`}
                      aria-label={`Lihat karyawan departemen ${dept.name}`}
                      className="text-xs text-primary hover:text-primary/80 p-1.5 rounded-lg hover:bg-primary/10"
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
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">{t('quickActions')}</CardTitle>
            <CardDescription className="text-xs">{t('quickActionsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Link
              href="/employees"
              className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2 font-medium text-foreground">
                <Users className="w-4 h-4 text-primary" />
                {tEmp('addEmployee')}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              href="/leave-requests"
              className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2 font-medium text-foreground">
                <CalendarDays className="w-4 h-4 text-amber-600" />
                {tLeave('title')}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              href="/payrolls"
              className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2 font-medium text-foreground">
                <CreditCard className="w-4 h-4 text-purple-600" />
                {tPayroll('title')}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              href="/attendances"
              className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2 font-medium text-foreground">
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                {tAtt('title')}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const locale = useLocale();
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
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">{t('teamMembers')}</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loadingTeam ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : totalTeamMembers}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{t('teamMembersDesc')}</p>
            <Link
              href="/employees"
              className="text-xs text-primary font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              {tCommon('viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 2: Cuti Perlu Di-approve */}
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">{t('teamLeaves')}</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loadingLeaves ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : pendingTeamLeaves}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{t('teamLeavesDesc')}</p>
            <Link
              href="/leave-requests"
              className="text-xs text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1 mt-3 hover:underline"
            >
              {tCommon('viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 3: Kehadiran Tim Hari Ini */}
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">{t('teamAttendance')}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold text-foreground">
              {loadingAttendance || loadingTeam ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                `${presentCount + lateCount} / ${totalTeamMembers}`
              )}
            </div>
            {!loadingAttendance && !loadingTeam && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{t('teamAttendance')}</span>
                  <span className="font-semibold text-foreground">
                    {totalTeamMembers > 0
                      ? Math.round(((presentCount + lateCount) / totalTeamMembers) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress
                  value={
                    totalTeamMembers > 0
                      ? Math.round(((presentCount + lateCount) / totalTeamMembers) * 100)
                      : 0
                  }
                  aria-label="Tingkat kehadiran tim hari ini"
                  className="h-2 w-full bg-muted"
                />
              </div>
            )}
            <Link
              href="/attendances"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 mt-1 hover:underline"
            >
              {t('viewRecap')} <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Absensi & List Cuti Pending Tim */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">{t('todayAttendanceRate')}</CardTitle>
            <CardDescription className="text-xs">
              {t('todayAttendanceDesc', { date: todayStr })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">
                  {t('onTime')}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {presentCount}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 block">
                  {t('late')}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {lateCount}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                <div className="flex items-center justify-center text-destructive mb-1">
                  <XCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-destructive block">
                  {t('absent')}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {absentCount}
                </span>
              </div>
            </div>

            <Link
              href="/attendances"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full text-xs')}
            >
              {t('viewRecap')}
            </Link>
          </CardContent>
        </Card>

        {/* Permohonan Cuti Tim Menunggu Persetujuan */}
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">{t('teamLeaves')}</CardTitle>
              <CardDescription className="text-xs">
                {t('teamLeavesDesc')}
              </CardDescription>
            </div>
            <Link
              href="/leave-requests"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8')}
            >
              {tCommon('viewAll')}
            </Link>
          </CardHeader>
          <CardContent>
            {loadingLeaves ? (
              <div className="py-6 flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tCommon('loading')}
              </div>
            ) : (teamLeaves?.data || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                {t('noLeavesPending')}
              </div>
            ) : (
              <div className="space-y-2.5">
                {(teamLeaves?.data || []).slice(0, 3).map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {leave.employee?.fullName}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {leave.leaveType} • {new Date(leave.startDate).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID')} -{' '}
                        {new Date(leave.endDate).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID')}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">
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
  const t = useTranslations('dashboard');
  const tLeave = useTranslations('leave');
  const tPayroll = useTranslations('payroll');
  const tCommon = useTranslations('common');
  const locale = useLocale();

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
    return `Rp ${Math.abs(num).toLocaleString(locale === 'en' ? 'en-US' : 'id-ID')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-6">
      {/* Attendance Widget Hari Ini */}
      <AttendanceWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: Riwayat Permohonan Cuti Terbaru */}
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">{t('recentLeaveTitle')}</CardTitle>
              <CardDescription className="text-xs">
                {t('recentLeaveDesc')}
              </CardDescription>
            </div>
            <Link
              href="/leave-requests"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8')}
            >
              {tLeave('requestLeave')}
            </Link>
          </CardHeader>
          <CardContent>
            {loadingLeaves ? (
              <div className="py-6 flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tCommon('loading')}
              </div>
            ) : (recentLeaves?.data || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {t('noLeaves')}
              </div>
            ) : (
              <div className="space-y-2.5">
                {(recentLeaves?.data || []).map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">
                        {leave.leaveType === 'ANNUAL'
                          ? tLeave('annual')
                          : leave.leaveType === 'SICK'
                          ? tLeave('sick')
                          : leave.leaveType === 'MATERNITY'
                          ? tLeave('maternity')
                          : tLeave('unpaid')}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                      </p>
                    </div>
                    {leave.status === 'APPROVED' ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                        {tLeave('statusApproved')}
                      </Badge>
                    ) : leave.status === 'REJECTED' ? (
                      <Badge variant="destructive" className="text-[10px]">
                        {tLeave('statusRejected')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">
                        {tLeave('statusPending')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Widget 2: Ringkasan Slip Gaji Terakhir */}
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">{t('lastPayslipTitle')}</CardTitle>
              <CardDescription className="text-xs">
                {t('lastPayslipDesc')}
              </CardDescription>
            </div>
            <Link
              href="/payrolls"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8')}
            >
              {tCommon('viewAll')}
            </Link>
          </CardHeader>
          <CardContent>
            {loadingPayroll ? (
              <div className="py-6 flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tCommon('loading')}
              </div>
            ) : !lastPayroll ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {t('noPaidPayslip')}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">{tPayroll('period')}:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(lastPayroll.periodStart)} – {formatDate(lastPayroll.periodEnd)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">{tCommon('status')}:</span>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                    {tPayroll('statusPaid')}
                  </Badge>
                </div>

                {lastPayroll.netSalary !== undefined && (
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {tPayroll('netSalary')}:
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {formatRupiah(lastPayroll.netSalary)}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/payrolls"
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full text-xs')}
                  >
                    {tPayroll('viewSlip')}
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

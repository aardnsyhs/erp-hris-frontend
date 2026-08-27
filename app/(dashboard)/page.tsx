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
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEmployees } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import { useLeaveRequests } from '@/hooks/use-leave-requests';
import { usePayrolls } from '@/hooks/use-payrolls';
import { useAttendances } from '@/hooks/use-attendance';
import { AttendanceWidget } from '@/components/attendance/attendance-widget';
import { PageHeader } from '@/components/shared/page-header';
import { MetricStrip, MetricItem } from '@/components/shared/metric-strip';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyValue } from '@/components/shared/money-value';
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
    <div className="space-y-5">
      {/* Console Header */}
      <PageHeader
        title={emp?.fullName || user?.email || 'Operations Console'}
        description={
          emp?.jobTitle && emp?.department?.name
            ? `${emp.jobTitle} • ${emp.department.name} — ${t('welcomeDesc')}`
            : t('welcomeDesc')
        }
        badge={
          <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 tracking-wider uppercase">
            <Shield className="w-3 h-3 mr-1 text-primary" />
            {role.replace('_', ' ')}
          </Badge>
        }
      />

      {/* Role-Specific Dashboard Views */}
      {role === 'HR_ADMIN' && <HRAdminDashboard />}
      {role === 'MANAGER' && <ManagerDashboard departmentId={emp?.departmentId} />}
      {role === 'EMPLOYEE' && <EmployeeDashboard employeeId={emp?.id} />}
    </div>
  );
}

// -------------------------------------------------------------
// 1. HR ADMINISTRATOR OPERATIONS CONSOLE
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
    limit: 5,
  });
  const { data: payrollsData, isLoading: loadingPayrolls } = usePayrolls({
    status: 'DRAFT',
    limit: 5,
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

  const hrMetrics: MetricItem[] = [
    {
      id: 'active_employees',
      label: t('activeEmployees'),
      value: loadingEmployees ? '—' : totalActiveEmployees,
      description: t('activeEmployeesDesc'),
      icon: Users,
      action: (
        <Link href="/employees" className="text-primary hover:underline font-semibold font-mono text-[11px] inline-flex items-center gap-0.5">
          {t('viewDirectory')} <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
    {
      id: 'pending_leaves',
      label: t('pendingLeaves'),
      value: loadingLeaves ? '—' : pendingLeaves,
      description: t('pendingLeavesDesc'),
      icon: Clock,
      badge: pendingLeaves > 0 ? (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[var(--status-warning-bg)] text-[var(--status-warning)]">
          ACTION
        </span>
      ) : undefined,
      action: (
        <Link href="/leave-requests" className="text-primary hover:underline font-semibold font-mono text-[11px] inline-flex items-center gap-0.5">
          {t('reviewLeaves')} <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
    {
      id: 'draft_payroll',
      label: t('draftPayroll'),
      value: loadingPayrolls ? '—' : draftPayrolls,
      description: t('draftPayrollDesc'),
      icon: CreditCard,
      badge: draftPayrolls > 0 ? (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[var(--status-warning-bg)] text-[var(--status-warning)]">
          DRAFT
        </span>
      ) : undefined,
      action: (
        <Link href="/payrolls" className="text-primary hover:underline font-semibold font-mono text-[11px] inline-flex items-center gap-0.5">
          {t('processPayroll')} <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
    {
      id: 'departments',
      label: t('totalDepartments'),
      value: loadingDepartments ? '—' : departments.length,
      description: t('totalDepartmentsDesc'),
      icon: Building2,
      action: (
        <Link href="/departments" className="text-primary hover:underline font-semibold font-mono text-[11px] inline-flex items-center gap-0.5">
          {t('manageDepartments')} <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Metric Operational Strip */}
      <MetricStrip metrics={hrMetrics} />

      {/* Operational Attention Queue & Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Attention Required Work Queue */}
        <div className="lg:col-span-2 space-y-5">
          {/* Attendance Rate Progress Console */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  {t('todayAttendanceRate')}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('todayAttendanceDesc', { date: todayStr })}
                </p>
              </div>
              <Link
                href="/attendances"
                className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'text-xs font-mono h-7')}
              >
                {t('viewRecap')}
              </Link>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-medium text-foreground">
                  {t('presentSummary', { present: presentCount, total: totalActiveEmployees })}
                </span>
                <span className="font-bold text-foreground tabular-nums">
                  {attendancePercentage}%
                </span>
              </div>
              <Progress
                value={attendancePercentage}
                aria-label={`Attendance rate ${attendancePercentage}%`}
                className="h-2 w-full bg-muted"
              />
            </div>
          </div>

          {/* Department Headcount Allocation Matrix */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  {t('departmentStructure')}
                </h2>
                <p className="text-xs text-muted-foreground">{t('departmentStructureDesc')}</p>
              </div>
              <Link
                href="/departments"
                className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'text-xs font-mono h-7')}
              >
                {tCommon('viewAll')}
              </Link>
            </div>

            {loadingDepartments ? (
              <div className="py-6 flex items-center justify-center text-xs text-muted-foreground font-mono">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tCommon('loading')}
              </div>
            ) : departments.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">{t('noDepartmentsFound')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-2.5 rounded-md border border-border bg-muted/20 flex items-center justify-between hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {dept.name}
                        </span>
                        <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-muted border border-border text-muted-foreground">
                          {dept.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {t('departmentHeadcount', { count: dept._count?.employees ?? 0 })}
                      </p>
                    </div>
                    <Link
                      href={`/employees?departmentId=${dept.id}`}
                      aria-label={`View employees in ${dept.name}`}
                      className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Operational Shortcuts & Action Items */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="pb-2 border-b border-border/70">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                {t('quickActions')}
              </h2>
              <p className="text-xs text-muted-foreground">{t('quickActionsDesc')}</p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <Link
                href="/employees"
                className="flex items-center justify-between p-2.5 rounded-md border border-border hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  {tEmp('addEmployee')}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/leave-requests"
                className="flex items-center justify-between p-2.5 rounded-md border border-border hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <CalendarDays className="w-4 h-4 text-[var(--status-warning)]" />
                  {tLeave('title')}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/payrolls"
                className="flex items-center justify-between p-2.5 rounded-md border border-border hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <CreditCard className="w-4 h-4 text-primary" />
                  {tPayroll('title')}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/attendances"
                className="flex items-center justify-between p-2.5 rounded-md border border-border hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <CalendarCheck2 className="w-4 h-4 text-[var(--status-success)]" />
                  {tAtt('title')}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. DEPARTMENT MANAGER OPERATIONS CONSOLE
// -------------------------------------------------------------
function ManagerDashboard({ departmentId }: { departmentId?: string | null }) {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tAtt = useTranslations('attendance');
  const tLeave = useTranslations('leave');
  const locale = useLocale();
  const todayStr = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const { data: teamData, isLoading: loadingTeam } = useEmployees({
    departmentId: departmentId || undefined,
    status: 'ACTIVE',
    limit: 1,
  });
  const { data: teamLeavesData, isLoading: loadingLeaves } = useLeaveRequests({
    departmentId: departmentId || undefined,
    status: 'PENDING',
    limit: 5,
  });
  const { data: attendanceData, isLoading: loadingAttendance } = useAttendances({
    departmentId: departmentId || undefined,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    limit: 100,
  });

  const totalTeamMembers = teamData?.meta?.total ?? 0;
  const pendingTeamLeaves = teamLeavesData?.meta?.total ?? 0;

  const attendanceList = attendanceData?.data || [];
  const presentCount = attendanceList.filter((a) => a.status === 'PRESENT').length;
  const lateCount = attendanceList.filter((a) => a.status === 'LATE').length;
  const absentCount = attendanceList.filter((a) => a.status === 'ABSENT').length;

  const managerMetrics: MetricItem[] = [
    {
      id: 'team_headcount',
      label: t('teamMembers'),
      value: loadingTeam ? '—' : totalTeamMembers,
      description: t('teamMembersDesc'),
      icon: Users,
      action: (
        <Link href="/employees" className="text-primary hover:underline font-semibold font-mono text-[11px] inline-flex items-center gap-0.5">
          {tCommon('viewAll')} <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
    {
      id: 'pending_team_leaves',
      label: t('teamLeaves'),
      value: loadingLeaves ? '—' : pendingTeamLeaves,
      description: t('teamLeavesDesc'),
      icon: Clock,
      badge: pendingTeamLeaves > 0 ? (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[var(--status-warning-bg)] text-[var(--status-warning)]">
          ACTION
        </span>
      ) : undefined,
      action: (
        <Link href="/leave-requests" className="text-primary hover:underline font-semibold font-mono text-[11px] inline-flex items-center gap-0.5">
          {tCommon('viewAll')} <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
    {
      id: 'on_time_today',
      label: t('onTime'),
      value: loadingAttendance ? '—' : presentCount,
      description: t('onScheduleToday'),
      icon: CheckCircle2,
    },
    {
      id: 'late_or_absent',
      label: t('late'),
      value: loadingAttendance ? '—' : `${lateCount + absentCount}`,
      description: t('lateOrAbsentDesc', { late: lateCount, absent: absentCount }),
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Metric Operational Strip */}
      <MetricStrip metrics={managerMetrics} />

      {/* Breakdown & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance Breakdown Matrix */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                {t('todayAttendanceRate')}
              </h2>
              <p className="text-xs text-muted-foreground">{t('todayAttendanceDesc', { date: todayStr })}</p>
            </div>
            <Link
              href="/attendances"
              className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'text-xs font-mono h-7')}
            >
              {t('viewRecap')}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-md border border-[var(--status-success)]/20 bg-[var(--status-success-bg)]">
              <span className="text-xs font-semibold text-[var(--status-success)] block font-mono">
                {t('onTime')}
              </span>
              <span className="text-xl font-bold font-mono text-foreground tabular-nums">
                {presentCount}
              </span>
            </div>

            <div className="p-3 rounded-md border border-[var(--status-warning)]/20 bg-[var(--status-warning-bg)]">
              <span className="text-xs font-semibold text-[var(--status-warning)] block font-mono">
                {t('late')}
              </span>
              <span className="text-xl font-bold font-mono text-foreground tabular-nums">
                {lateCount}
              </span>
            </div>

            <div className="p-3 rounded-md border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)]">
              <span className="text-xs font-semibold text-[var(--status-danger)] block font-mono">
                {t('absent')}
              </span>
              <span className="text-xl font-bold font-mono text-foreground tabular-nums">
                {absentCount}
              </span>
            </div>
          </div>
        </div>

        {/* Pending Team Leaves Queue */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                {t('teamLeaves')}
              </h2>
              <p className="text-xs text-muted-foreground">{t('teamLeavesDesc')}</p>
            </div>
            <Link
              href="/leave-requests"
              className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'text-xs font-mono h-7')}
            >
              {tCommon('viewAll')}
            </Link>
          </div>

          {loadingLeaves ? (
            <div className="py-6 flex items-center justify-center text-xs text-muted-foreground font-mono">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {tCommon('loading')}
            </div>
          ) : (teamLeavesData?.data || []).length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground font-mono">
              <CheckCircle2 className="w-5 h-5 mx-auto text-[var(--status-success)] mb-1.5" />
              {t('noLeavesPending')}
            </div>
          ) : (
            <div className="space-y-2">
              {(teamLeavesData?.data || []).slice(0, 3).map((leave) => (
                <div
                  key={leave.id}
                  className="p-2.5 rounded-md border border-border bg-muted/20 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">
                      {leave.employee?.fullName}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {leave.leaveType} • {new Date(leave.startDate).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID')} –{' '}
                      {new Date(leave.endDate).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID')}
                    </p>
                  </div>
                  <StatusBadge status="PENDING" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. EMPLOYEE PERSONAL CONSOLE
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

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-5">
      {/* Attendance Realtime Session Console Widget */}
      <AttendanceWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Leave Requests */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                {t('recentLeaveTitle')}
              </h2>
              <p className="text-xs text-muted-foreground">{t('recentLeaveDesc')}</p>
            </div>
            <Link
              href="/leave-requests"
              className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'text-xs font-mono h-7')}
            >
              {tLeave('requestLeave')}
            </Link>
          </div>

          {loadingLeaves ? (
            <div className="py-6 flex items-center justify-center text-xs text-muted-foreground font-mono">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {tCommon('loading')}
            </div>
          ) : (recentLeaves?.data || []).length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground font-mono">
              {t('noLeaves')}
            </div>
          ) : (
            <div className="space-y-2">
              {(recentLeaves?.data || []).map((leave) => (
                <div
                  key={leave.id}
                  className="p-2.5 rounded-md border border-border bg-muted/20 flex items-center justify-between text-xs"
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
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Payslip Distribution Preview */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                {t('lastPayslipTitle')}
              </h2>
              <p className="text-xs text-muted-foreground">{t('lastPayslipDesc')}</p>
            </div>
            <Link
              href="/payrolls"
              className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'text-xs font-mono h-7')}
            >
              {tCommon('viewAll')}
            </Link>
          </div>

          {loadingPayroll ? (
            <div className="py-6 flex items-center justify-center text-xs text-muted-foreground font-mono">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {tCommon('loading')}
            </div>
          ) : !lastPayroll ? (
            <div className="py-6 text-center text-xs text-muted-foreground font-mono">
              {t('noPaidPayslip')}
            </div>
          ) : (
            <div className="p-3.5 rounded-md border border-border bg-muted/20 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{tPayroll('period')}:</span>
                <span className="font-semibold text-foreground">
                  {formatDate(lastPayroll.periodStart)} – {formatDate(lastPayroll.periodEnd)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{tCommon('status')}:</span>
                <StatusBadge status={lastPayroll.status} />
              </div>

              {lastPayroll.netSalary !== undefined && (
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">
                    {tPayroll('netSalary')}:
                  </span>
                  <MoneyValue amount={lastPayroll.netSalary} className="text-sm font-bold" />
                </div>
              )}

              <div className="pt-1">
                <Link
                  href="/payrolls"
                  className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'w-full text-xs font-mono h-7')}
                >
                  {tPayroll('viewSlip')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

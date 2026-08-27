'use client';

import React, { useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  Clock,
  Settings,
  Filter,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAttendances } from '@/hooks/use-attendance';
import { useDepartments } from '@/hooks/use-departments';
import { Attendance, AttendanceStatus } from '@/types/attendance';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-picker';
import { AttendanceWidget } from '@/components/attendance/attendance-widget';
import { WorkScheduleDialog } from '@/components/attendance/work-schedule-dialog';

export default function AttendancesPage() {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const tEmp = useTranslations('employees');
  const locale = useLocale();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';
  const isManager = currentUser?.role === 'MANAGER';
  const isEmployee = currentUser?.role === 'EMPLOYEE';

  // Filters & Pagination State
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Queries
  const { data: departmentsData } = useDepartments();
  const departments = departmentsData?.data || [];

  const { data, isLoading, isPlaceholderData } = useAttendances({
    page: pageIndex + 1,
    limit: pageSize,
    status: selectedStatus !== 'ALL' ? (selectedStatus as AttendanceStatus) : undefined,
    departmentId: selectedDept !== 'ALL' ? selectedDept : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const attendances = data?.data || [];
  const meta = data?.meta;

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  // Format time helper
  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '-';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(timeStr));
  };

  // Calculate duration between check-in and check-out
  const formatDuration = (checkIn?: string | null, checkOut?: string | null) => {
    if (!checkIn || !checkOut) return '-';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffMinutes = Math.max(0, Math.floor((end - start) / (1000 * 60)));
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    if (locale === 'en') {
      if (h === 0) return `${m}m`;
      return `${h}h ${m > 0 ? `${m}m` : ''}`;
    }
    if (h === 0) return `${m}m`;
    return `${h}j ${m > 0 ? `${m}m` : ''}`;
  };

  // Table Columns Definition
  const columns: ColumnDef<Attendance>[] = [
    {
      accessorKey: 'attendanceDate',
      header: tCommon('from'),
      cell: ({ row }) => (
        <span className="font-medium text-xs text-foreground">
          {formatDate(row.original.attendanceDate)}
        </span>
      ),
    },
    ...(!isEmployee
      ? [
          {
            accessorKey: 'employee',
            header: tEmp('fullName'),
            cell: ({ row }: { row: { original: Attendance } }) => {
              const emp = row.original.employee;
              return (
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-foreground">
                    {emp?.fullName || '-'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="font-mono">{emp?.nip}</span>
                    {emp?.department?.name && (
                      <>
                        <span>•</span>
                        <span>{emp.department.name}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: 'checkIn',
      header: t('checkInTime'),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-foreground">
          {formatTime(row.original.checkIn)}
        </span>
      ),
    },
    {
      accessorKey: 'checkOut',
      header: t('checkOutTime'),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-foreground">
          {formatTime(row.original.checkOut)}
        </span>
      ),
    },
    {
      id: 'duration',
      header: t('duration'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-medium">
          {formatDuration(row.original.checkIn, row.original.checkOut)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: tCommon('status'),
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'PRESENT') {
          return (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('statusPresent')}
            </Badge>
          );
        }
        if (status === 'LATE') {
          return (
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('statusLate')}
            </Badge>
          );
        }
        return (
          <Badge variant="destructive" className="text-[11px] gap-1">
            <XCircle className="w-3.5 h-3.5" />
            {t('statusAbsent')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: t('notes'),
      cell: ({ row }) => {
        const notes = row.original.notes;
        return (
          <span className="text-xs text-muted-foreground truncate max-w-50 block">
            {notes || '-'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t('title')}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>

        {isHrAdmin && (
          <Button
            variant="outline"
            onClick={() => setIsScheduleOpen(true)}
            className="border-border shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
            {t('workSchedule')}
          </Button>
        )}
      </div>

      {/* Real-Time Attendance Action Widget */}
      <AttendanceWidget />

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>{tCommon('filter')}:</span>
        </div>

        {/* Status Filter */}
        <div className="w-44">
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              if (val) {
                setSelectedStatus(val);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }
            }}
          >
            <SelectTrigger className="h-9 text-xs w-full bg-card">
              <SelectValue placeholder={tCommon('allStatus')}>
                {selectedStatus === 'ALL'
                  ? tCommon('allStatus')
                  : selectedStatus === 'PRESENT'
                  ? t('statusPresent')
                  : selectedStatus === 'LATE'
                  ? t('statusLate')
                  : selectedStatus === 'ABSENT'
                  ? t('statusAbsent')
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{tCommon('allStatus')}</SelectItem>
              <SelectItem value="PRESENT">{t('statusPresent')}</SelectItem>
              <SelectItem value="LATE">{t('statusLate')}</SelectItem>
              <SelectItem value="ABSENT">{t('statusAbsent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter (HR Admin only) */}
        {isHrAdmin && (
          <div className="w-52">
            <Select
              value={selectedDept}
              onValueChange={(val) => {
                if (val) {
                  setSelectedDept(val);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }
              }}
            >
              <SelectTrigger className="h-9 text-xs w-full bg-card">
                <SelectValue placeholder={tCommon('allDepartments')}>
                  {selectedDept === 'ALL'
                    ? tCommon('allDepartments')
                    : departments.find((d) => d.id === selectedDept)?.name || tCommon('allDepartments')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tCommon('allDepartments')}</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date Range Picker */}
        <div className="w-64">
          <DateRangePicker
            from={startDate}
            to={endDate}
            onChange={({ from, to }) => {
              setStartDate(from);
              setEndDate(to);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            placeholder={t('dateRangePlaceholder')}
            allowClear
          />
        </div>

        {(startDate || endDate || selectedStatus !== 'ALL' || selectedDept !== 'ALL') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStatus('ALL');
              setSelectedDept('ALL');
              setStartDate('');
              setEndDate('');
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="text-xs text-muted-foreground h-9 cursor-pointer"
          >
            {tCommon('resetFilter')}
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={attendances}
        isLoading={isLoading || isPlaceholderData}
        totalRows={meta?.total}
        pageCount={meta?.totalPages}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={setPagination}
        emptyTitle={t('noAttendanceRecords')}
        emptyDescription={t('noAttendanceRecords')}
      />

      {/* Work Schedule Dialog (HR_ADMIN only) */}
      <WorkScheduleDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  Clock,
  Settings,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAttendances } from '@/hooks/use-attendance';
import { useDepartments } from '@/hooks/use-departments';
import { Attendance, AttendanceStatus } from '@/types/attendance';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageHeader } from '@/components/shared/page-header';
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

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

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

  const formatDuration = (checkIn?: string | null, checkOut?: string | null) => {
    if (!checkIn || !checkOut) return '-';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffMinutes = Math.max(0, Math.floor((end - start) / (1000 * 60)));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const resetFilters = () => {
    setSelectedStatus('ALL');
    setSelectedDept('ALL');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const hasActiveFilters =
    selectedStatus !== 'ALL' || selectedDept !== 'ALL' || startDate !== '' || endDate !== '';

  const columns: ColumnDef<Attendance>[] = [
    {
      accessorKey: 'attendanceDate',
      header: 'Shift Date',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
          {formatDate(row.original.attendanceDate)}
        </span>
      ),
    },
    ...(!isEmployee
      ? [
          {
            accessorKey: 'employee.fullName',
            header: tEmp('fullName'),
            cell: ({ row }: { row: { original: Attendance } }) => {
              const emp = row.original.employee;
              if (!emp) return <span className="text-muted-foreground">-</span>;
              return (
                <div className="flex flex-col min-w-0">
                  <Link
                    href={`/employees/${emp.id}`}
                    className="font-semibold text-foreground text-xs hover:text-primary hover:underline transition-colors truncate"
                  >
                    {emp.fullName}
                  </Link>
                  <span className="text-[11px] font-mono text-muted-foreground truncate">
                    {emp.nip} {emp.department?.name ? `• ${emp.department.name}` : ''}
                  </span>
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
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          {formatTime(row.original.checkIn)}
        </span>
      ),
    },
    {
      accessorKey: 'checkOut',
      header: t('checkOutTime'),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          {formatTime(row.original.checkOut)}
        </span>
      ),
    },
    {
      id: 'duration',
      header: t('duration'),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDuration(row.original.checkIn, row.original.checkOut)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'notes',
      header: t('notes'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground truncate max-w-44 block font-mono">
          {row.original.notes || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          isHrAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleOpen(true)}
              className="text-xs h-8.5 cursor-pointer font-mono"
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              {t('workSchedule')}
            </Button>
          )
        }
      />

      {/* Operator Attendance Widget */}
      <AttendanceWidget />

      {/* Operations Record Table & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {isHrAdmin && (
            <Select
              value={selectedDept}
              onValueChange={(val: string | null) => {
                if (val) {
                  setSelectedDept(val);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }
              }}
            >
              <SelectTrigger className="w-[180px] h-8.5 text-xs bg-card border-border rounded-md font-mono">
                <SelectValue placeholder={tCommon('allDepartments')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">{tCommon('allDepartments')}</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id} className="text-xs">
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={selectedStatus}
            onValueChange={(val: string | null) => {
              if (val) {
                setSelectedStatus(val);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }
            }}
          >
            <SelectTrigger className="w-[150px] h-8.5 text-xs bg-card border-border rounded-md font-mono">
              <SelectValue placeholder={tCommon('allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">{tCommon('allStatus')}</SelectItem>
              <SelectItem value="PRESENT" className="text-xs">{t('statusPresent')}</SelectItem>
              <SelectItem value="LATE" className="text-xs">{t('statusLate')}</SelectItem>
              <SelectItem value="ABSENT" className="text-xs">{t('statusAbsent')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Control */}
          <div className="w-[240px]">
            <DateRangePicker
              from={startDate}
              to={endDate}
              placeholder={t('dateRangePlaceholder')}
              onChange={(range) => {
                setStartDate(range.from);
                setEndDate(range.to);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-8.5 px-2 font-mono"
            >
              <X className="w-3 h-3 mr-1" />
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
      </div>

      {/* Schedule Dialog */}
      <WorkScheduleDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
      />
    </div>
  );
}

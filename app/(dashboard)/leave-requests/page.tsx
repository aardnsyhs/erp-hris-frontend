'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarDays,
  Plus,
  Eye,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  useApproveLeaveRequest,
  useLeaveRequests,
} from '@/hooks/use-leave-requests';
import { useDepartments } from '@/hooks/use-departments';
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from '@/types/leave-request';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LeaveRequestFormDialog } from '@/components/leave-requests/leave-request-form-dialog';
import { LeaveRejectDialog } from '@/components/leave-requests/leave-reject-dialog';
import { LeaveDetailDialog } from '@/components/leave-requests/leave-detail-dialog';
import { cn } from '@/lib/utils';

export default function LeaveRequestsPage() {
  const t = useTranslations('leave');
  const tCommon = useTranslations('common');
  const tEmp = useTranslations('employees');
  const locale = useLocale();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';
  const isManager = currentUser?.role === 'MANAGER';
  const isApproverRole = isHrAdmin || isManager;
  const currentEmployeeId = currentUser?.employeeId;

  // Active Tab for Approvers: 'PENDING_APPROVALS' vs 'ALL_HISTORY'
  const [activeTab, setActiveTab] = useState<'PENDING_APPROVALS' | 'ALL_HISTORY'>(
    isApproverRole ? 'PENDING_APPROVALS' : 'ALL_HISTORY',
  );

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Dialogs State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedForDetail, setSelectedForDetail] = useState<LeaveRequest | null>(
    null,
  );
  const [selectedForReject, setSelectedForReject] = useState<LeaveRequest | null>(
    null,
  );

  // Mutations
  const approveMutation = useApproveLeaveRequest();

  // Queries
  const { data: departmentsData } = useDepartments();
  const departments = departmentsData?.data || [];

  const isPendingTab = isApproverRole && activeTab === 'PENDING_APPROVALS';

  const { data, isLoading, isPlaceholderData } = useLeaveRequests({
    page: pageIndex + 1,
    limit: pageSize,
    status: isPendingTab
      ? 'PENDING'
      : selectedStatus !== 'ALL'
      ? (selectedStatus as LeaveRequestStatus)
      : undefined,
    leaveType: selectedLeaveType !== 'ALL' ? (selectedLeaveType as LeaveType) : undefined,
    departmentId: selectedDept !== 'ALL' ? selectedDept : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const leaveRequests = data?.data || [];
  const meta = data?.meta;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const getDaysCount = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApprove = async (leave: LeaveRequest) => {
    try {
      await approveMutation.mutateAsync(leave.id);
    } catch {
      // Toast notification is handled by the hook
    }
  };

  const resetFilters = () => {
    setSelectedStatus('ALL');
    setSelectedLeaveType('ALL');
    setSelectedDept('ALL');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const hasActiveFilters =
    selectedStatus !== 'ALL' ||
    selectedLeaveType !== 'ALL' ||
    selectedDept !== 'ALL' ||
    startDate !== '' ||
    endDate !== '';

  const columns: ColumnDef<LeaveRequest>[] = [
    {
      accessorKey: 'employee.fullName',
      header: tEmp('fullName'),
      cell: ({ row }) => {
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
    {
      accessorKey: 'leaveType',
      header: t('leaveType'),
      cell: ({ row }) => (
        <span className="text-xs font-semibold font-mono text-foreground">
          {row.original.leaveType}
        </span>
      ),
    },
    {
      id: 'period',
      header: t('period'),
      cell: ({ row }) => (
        <div className="flex flex-col text-xs font-mono">
          <span className="font-medium text-foreground">
            {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {t('calendarDays', { count: getDaysCount(row.original.startDate, row.original.endDate) })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('statusPending').split(' ')[0],
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'reason',
      header: t('reason'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground truncate max-w-44 block" title={row.original.reason}>
          {row.original.reason}
        </span>
      ),
    },
    {
      id: 'actions',
      header: tCommon('actions'),
      cell: ({ row }) => {
        const leave = row.original;
        const isOwn = leave.employeeId === currentEmployeeId;
        const isPending = leave.status === 'PENDING';

        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSelectedForDetail(leave)}
              className="h-7 px-2 text-xs font-mono cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              {tCommon('detail')}
            </Button>

            {isApproverRole && isPending && (
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  {/* Approve Action */}
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          size="xs"
                          disabled={isOwn || approveMutation.isPending}
                          onClick={() => handleApprove(leave)}
                          className="h-7 px-2 bg-[var(--status-success)] hover:opacity-90 text-white text-xs font-mono cursor-pointer"
                        />
                      }
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      {t('approve')}
                    </TooltipTrigger>
                    <TooltipContent>
                      {isOwn ? t('cannotApproveOwn') : t('approve')}
                    </TooltipContent>
                  </Tooltip>

                  {/* Reject Action */}
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="outline"
                          size="xs"
                          disabled={isOwn}
                          onClick={() => setSelectedForReject(leave)}
                          className="h-7 px-2 text-[var(--status-danger)] border-[var(--status-danger)]/30 hover:bg-[var(--status-danger-bg)] text-xs font-mono cursor-pointer"
                        />
                      }
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      {t('reject')}
                    </TooltipTrigger>
                    <TooltipContent>
                      {isOwn ? t('cannotRejectOwn') : t('reject')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title={t('title')}
        description={isApproverRole ? t('subtitleApprover') : t('subtitleEmployee')}
        actions={
          <Button
            onClick={() => setIsFormOpen(true)}
            size="sm"
            className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-xs shrink-0 cursor-pointer font-medium text-xs h-8.5 rounded-md"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {t('requestLeave')}
          </Button>
        }
      />

      {/* Approver Switcher Tabs */}
      {isApproverRole && (
        <div className="flex items-center gap-1 border-b border-border pb-2 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('PENDING_APPROVALS');
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={cn(
              'px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5',
              activeTab === 'PENDING_APPROVALS'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Approvals Queue
          </button>
          <button
            onClick={() => {
              setActiveTab('ALL_HISTORY');
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={cn(
              'px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5',
              activeTab === 'ALL_HISTORY'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Leave History Matrix
          </button>
        </div>
      )}

      {/* Operational Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {!isPendingTab && (
          <Select
            value={selectedStatus}
            onValueChange={(val: string | null) => {
              if (val) {
                setSelectedStatus(val);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }
            }}
          >
            <SelectTrigger className="w-[140px] h-8.5 text-xs bg-card border-border rounded-md font-mono">
              <SelectValue placeholder={tCommon('allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">{tCommon('allStatus')}</SelectItem>
              <SelectItem value="PENDING" className="text-xs">{t('statusPending')}</SelectItem>
              <SelectItem value="APPROVED" className="text-xs">{t('statusApproved')}</SelectItem>
              <SelectItem value="REJECTED" className="text-xs">{t('statusRejected')}</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select
          value={selectedLeaveType}
          onValueChange={(val: string | null) => {
            if (val) {
              setSelectedLeaveType(val);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }
          }}
        >
          <SelectTrigger className="w-[150px] h-8.5 text-xs bg-card border-border rounded-md font-mono">
            <SelectValue placeholder={tCommon('allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">{tCommon('allTypes')}</SelectItem>
            <SelectItem value="ANNUAL" className="text-xs">{t('annual')}</SelectItem>
            <SelectItem value="SICK" className="text-xs">{t('sick')}</SelectItem>
            <SelectItem value="UNPAID" className="text-xs">{t('unpaid')}</SelectItem>
            <SelectItem value="MATERNITY" className="text-xs">{t('maternity')}</SelectItem>
          </SelectContent>
        </Select>

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
            <SelectTrigger className="w-[170px] h-8.5 text-xs bg-card border-border rounded-md font-mono">
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

        <div className="w-[230px]">
          <DateRangePicker
            from={startDate}
            to={endDate}
            placeholder={t('period')}
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

      {/* Table */}
      <DataTable
        columns={columns}
        data={leaveRequests}
        isLoading={isLoading || isPlaceholderData}
        totalRows={meta?.total}
        pageCount={meta?.totalPages}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={setPagination}
        emptyTitle={tCommon('noData')}
        emptyDescription={tCommon('noData')}
      />

      {/* Request Leave Dialog */}
      <LeaveRequestFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      {/* Detail Dialog */}
      <LeaveDetailDialog
        leaveRequest={selectedForDetail}
        open={!!selectedForDetail}
        onOpenChange={(open) => !open && setSelectedForDetail(null)}
      />

      {/* Reject Dialog */}
      <LeaveRejectDialog
        leaveRequest={selectedForReject}
        open={!!selectedForReject}
        onOpenChange={(open) => !open && setSelectedForReject(null)}
      />
    </div>
  );
}

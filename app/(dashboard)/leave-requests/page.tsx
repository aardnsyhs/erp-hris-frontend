'use client';

import React, { useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarDays,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  AlertCircle,
  Building2,
  Calendar,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LeaveRequestFormDialog } from '@/components/leave-requests/leave-request-form-dialog';
import { LeaveRejectDialog } from '@/components/leave-requests/leave-reject-dialog';
import { LeaveDetailDialog } from '@/components/leave-requests/leave-detail-dialog';

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
    leaveType:
      selectedLeaveType !== 'ALL' ? (selectedLeaveType as LeaveType) : undefined,
    departmentId: selectedDept !== 'ALL' ? selectedDept : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const leaveRequests = data?.data || [];
  const meta = data?.meta;

  // Helper date & duration
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getLeaveTypeBadge = (type: LeaveType) => {
    switch (type) {
      case 'ANNUAL':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[11px]">
            {t('annual')}
          </Badge>
        );
      case 'SICK':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px]">
            {t('sick')}
          </Badge>
        );
      case 'MATERNITY':
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[11px]">
            {t('maternity')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px]">
            {t('unpaid')}
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: LeaveRequestStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t('statusApproved')}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="text-[11px] gap-1">
            <XCircle className="w-3 h-3" />
            {t('statusRejected')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] gap-1">
            <Clock className="w-3 h-3" />
            {t('statusPending')}
          </Badge>
        );
    }
  };

  const handleApprove = async (leave: LeaveRequest) => {
    try {
      await approveMutation.mutateAsync(leave.id);
    } catch {
      // Toast notification is handled in mutation
    }
  };

  // Columns definition
  const columns: ColumnDef<LeaveRequest>[] = [
    ...(isApproverRole
      ? [
          {
            accessorKey: 'employee',
            header: tEmp('fullName'),
            cell: ({ row }: { row: { original: LeaveRequest } }) => {
              const emp = row.original.employee;
              const isSelf = emp?.id === currentEmployeeId;
              return (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-foreground">
                      {emp?.fullName || '-'}
                    </span>
                    {isSelf && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 bg-muted text-muted-foreground">
                        {tCommon('you')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
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
      accessorKey: 'leaveType',
      header: t('leaveType'),
      cell: ({ row }) => getLeaveTypeBadge(row.original.leaveType),
    },
    {
      id: 'period',
      header: t('period'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-foreground">
          <span>{formatDate(row.original.startDate)}</span>
          <span className="text-muted-foreground">–</span>
          <span>{formatDate(row.original.endDate)}</span>
        </div>
      ),
    },
    {
      id: 'duration',
      header: t('duration'),
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground">
          {tCommon('days', { count: calculateDays(row.original.startDate, row.original.endDate) })}
        </span>
      ),
    },
    {
      accessorKey: 'reason',
      header: t('reason'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground truncate max-w-48 block">
          {row.original.reason}
        </span>
      ),
    },
    ...(!isPendingTab
      ? [
          {
            accessorKey: 'status',
            header: tCommon('status'),
            cell: ({ row }: { row: { original: LeaveRequest } }) =>
              getStatusBadge(row.original.status),
          },
        ]
      : []),
    {
      id: 'actions',
      header: () => <div className="text-right">{tCommon('actions')}</div>,
      cell: ({ row }) => {
        const leave = row.original;
        const isSelf = leave.employeeId === currentEmployeeId;
        const isPending = leave.status === 'PENDING';

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Action for Approvers on Pending requests */}
            {isApproverRole && isPending && (
              <>
                {isSelf ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="inline-block">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled
                            className="h-8 px-2 text-muted-foreground opacity-50 cursor-not-allowed"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {t('approve')}
                          </Button>
                        </span>
                      }
                    />
                    <TooltipContent side="left" className="text-xs">
                      {t('cannotApproveOwn')}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(leave)}
                    disabled={approveMutation.isPending}
                    className="h-8 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {t('approve')}
                  </Button>
                )}

                {isSelf ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="inline-block">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled
                            className="h-8 px-2 text-muted-foreground opacity-50 cursor-not-allowed"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            {t('reject')}
                          </Button>
                        </span>
                      }
                    />
                    <TooltipContent side="left" className="text-xs">
                      {t('cannotRejectOwn')}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedForReject(leave)}
                    className="h-8 px-2.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    {t('reject')}
                  </Button>
                )}
              </>
            )}

            {/* View Detail Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedForDetail(leave)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              {tCommon('detail')}
            </Button>
          </div>
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
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t('title')}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isApproverRole
              ? t('subtitleApprover')
              : t('subtitleEmployee')}
          </p>
        </div>

        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('requestLeave')}
        </Button>
      </div>

      {/* Tabs Navigation for Approvers (Manager & HR Admin) */}
      {isApproverRole && (
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            if (val) {
              setActiveTab(val as 'PENDING_APPROVALS' | 'ALL_HISTORY');
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="PENDING_APPROVALS" className="gap-2 cursor-pointer">
              <Clock className="w-4 h-4" />
              {t('statusPending')}
            </TabsTrigger>
            <TabsTrigger value="ALL_HISTORY" className="gap-2 cursor-pointer">
              <CalendarDays className="w-4 h-4" />
              {tCommon('all')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Filter Toolbar (Rendered on History view) */}
      {(!isApproverRole || activeTab === 'ALL_HISTORY') && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span>{tCommon('filter')}:</span>
          </div>

          {/* Status Filter */}
          <div className="w-40">
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
                    : selectedStatus === 'PENDING'
                    ? t('statusPending')
                    : selectedStatus === 'APPROVED'
                    ? t('statusApproved')
                    : selectedStatus === 'REJECTED'
                    ? t('statusRejected')
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tCommon('allStatus')}</SelectItem>
                <SelectItem value="PENDING">{t('statusPending')}</SelectItem>
                <SelectItem value="APPROVED">{t('statusApproved')}</SelectItem>
                <SelectItem value="REJECTED">{t('statusRejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leave Type Filter */}
          <div className="w-40">
            <Select
              value={selectedLeaveType}
              onValueChange={(val) => {
                if (val) {
                  setSelectedLeaveType(val);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }
              }}
            >
              <SelectTrigger className="h-9 text-xs w-full bg-card">
                <SelectValue placeholder={tCommon('allTypes')}>
                  {selectedLeaveType === 'ALL'
                    ? tCommon('allTypes')
                    : selectedLeaveType === 'ANNUAL'
                    ? t('annual')
                    : selectedLeaveType === 'SICK'
                    ? t('sick')
                    : selectedLeaveType === 'UNPAID'
                    ? t('unpaid')
                    : selectedLeaveType === 'MATERNITY'
                    ? t('maternity')
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tCommon('allTypes')}</SelectItem>
                <SelectItem value="ANNUAL">{t('annual')}</SelectItem>
                <SelectItem value="SICK">{t('sick')}</SelectItem>
                <SelectItem value="UNPAID">{t('unpaid')}</SelectItem>
                <SelectItem value="MATERNITY">{t('maternity')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter (HR Admin only) */}
          {isHrAdmin && (
            <div className="w-48">
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
              placeholder={t('period')}
              allowClear
            />
          </div>

          {(startDate || endDate || selectedStatus !== 'ALL' || selectedLeaveType !== 'ALL' || selectedDept !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedLeaveType('ALL');
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
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={leaveRequests}
        isLoading={isLoading || isPlaceholderData}
        totalRows={meta?.total}
        pageCount={meta?.totalPages}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={setPagination}
        emptyTitle={isPendingTab ? tCommon('empty') : tCommon('noData')}
        emptyDescription={isPendingTab ? tCommon('empty') : tCommon('noData')}
      />

      {/* Form Dialog */}
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

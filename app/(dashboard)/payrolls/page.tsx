'use client';

import React, { useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  Banknote,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  ShieldCheck,
  AlertTriangle,
  MoreHorizontal,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  usePayrolls,
  useProcessPayroll,
  usePayPayroll,
} from '@/hooks/use-payrolls';
import { useDepartments } from '@/hooks/use-departments';
import { Payroll, PayrollStatus } from '@/types/payroll';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PayrollGenerateDialog } from '@/components/payroll/payroll-generate-dialog';
import { PayrollEditDialog } from '@/components/payroll/payroll-edit-dialog';
import { PayrollDeleteDialog } from '@/components/payroll/payroll-delete-dialog';
import { PayslipDialog } from '@/components/payroll/payslip-dialog';

export default function PayrollsPage() {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');
  const tEmp = useTranslations('employees');
  const tNav = useTranslations('navigation');
  const locale = useLocale();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';
  const isEmployee = currentUser?.role === 'EMPLOYEE';

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Dialogs State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<Payroll | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<Payroll | null>(
    null,
  );
  const [selectedForDetail, setSelectedForDetail] = useState<Payroll | null>(
    null,
  );

  // Mutations
  const processMutation = useProcessPayroll();
  const payMutation = usePayPayroll();

  // Queries
  const { data: departmentsData } = useDepartments();
  const departments = departmentsData?.data || [];

  const { data, isLoading, isPlaceholderData } = usePayrolls({
    page: pageIndex + 1,
    limit: pageSize,
    status:
      selectedStatus !== 'ALL' ? (selectedStatus as PayrollStatus) : undefined,
    departmentId: selectedDept !== 'ALL' ? selectedDept : undefined,
    periodStart: periodStart || undefined,
    periodEnd: periodEnd || undefined,
  });

  const payrolls = data?.data || [];
  const meta = data?.meta;

  // Format Helpers
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const formatCurrency = (val?: string | number) => {
    if (val === undefined || val === null) return null;
    const num = Number(val);
    const formatted = Math.abs(num).toLocaleString(locale === 'en' ? 'en-US' : 'id-ID');
    if (num < 0) {
      return `(Rp ${formatted})`;
    }
    return `Rp ${formatted}`;
  };

  const getStatusBadge = (status: PayrollStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t('statusPaid')}
          </Badge>
        );
      case 'PROCESSED':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[11px] gap-1">
            <Clock className="w-3 h-3" />
            {t('statusProcessed')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] gap-1">
            <Clock className="w-3 h-3" />
            {t('statusDraft')}
          </Badge>
        );
    }
  };

  const handleProcess = async (payroll: Payroll) => {
    try {
      await processMutation.mutateAsync(payroll.id);
    } catch {
      // Handled in hook
    }
  };

  const handlePay = async (payroll: Payroll) => {
    try {
      await payMutation.mutateAsync(payroll.id);
    } catch {
      // Handled in hook
    }
  };

  // Columns definition
  const columns: ColumnDef<Payroll>[] = [
    {
      id: 'period',
      header: t('period'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-foreground font-medium">
          <span>{formatDate(row.original.periodStart)}</span>
          <span className="text-muted-foreground">–</span>
          <span>{formatDate(row.original.periodEnd)}</span>
        </div>
      ),
    },
    ...(!isEmployee
      ? [
          {
            accessorKey: 'employee',
            header: tEmp('fullName'),
            cell: ({ row }: { row: { original: Payroll } }) => {
              const emp = row.original.employee;
              return (
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-foreground">
                    {emp?.fullName || '-'}
                  </span>
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
      id: 'netSalary',
      header: t('netSalary'),
      cell: ({ row }) => {
        const net = row.original.netSalary;
        if (net === undefined) {
          return (
            <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] gap-1">
              <ShieldCheck className="w-3 h-3 text-muted-foreground" />
              {t('protectedInfo')}
            </Badge>
          );
        }

        const numNet = Number(net);
        const isNegative = numNet < 0;

        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-xs font-semibold ${
                isNegative
                  ? 'text-destructive'
                  : 'text-foreground'
              }`}
            >
              {formatCurrency(net)}
            </span>
            {isNegative && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0 gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                Review
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: tCommon('status'),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'paymentDate',
      header: t('paymentDate'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.paymentDate ? formatDate(row.original.paymentDate) : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{tCommon('actions')}</div>,
      cell: ({ row }) => {
        const payroll = row.original;
        const status = payroll.status;

        return (
          <div className="flex items-center justify-end gap-1.5">
            {isHrAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={tNav('menuAction')}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground outline-none cursor-pointer"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                      {tCommon('actions')}
                    </DropdownMenuLabel>

                    {/* View Slip */}
                    <DropdownMenuItem
                      onClick={() => setSelectedForDetail(payroll)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="h-4 w-4 text-primary" />
                      <span>{t('viewSlip')}</span>
                    </DropdownMenuItem>

                    {/* Process Action (DRAFT -> PROCESSED) */}
                    {status === 'DRAFT' && (
                      <DropdownMenuItem
                        onClick={() => handleProcess(payroll)}
                        className="flex items-center gap-2 text-primary cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        <span>{t('processPayroll')}</span>
                      </DropdownMenuItem>
                    )}

                    {/* Pay Action (PROCESSED -> PAID) */}
                    {status === 'PROCESSED' && (
                      <DropdownMenuItem
                        onClick={() => handlePay(payroll)}
                        className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>{t('markAsPaid')}</span>
                      </DropdownMenuItem>
                    )}

                    {/* Edit Action (DRAFT only) */}
                    {status === 'DRAFT' && (
                      <DropdownMenuItem
                        onClick={() => setSelectedForEdit(payroll)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                        <span>{t('editDraft')}</span>
                      </DropdownMenuItem>
                    )}

                    {/* Delete Action (DRAFT only) */}
                    {status === 'DRAFT' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSelectedForDelete(payroll)}
                          className="flex items-center gap-2 text-destructive cursor-pointer focus:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{t('deleteDraft')}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Non HR-Admin view (Employee or Manager) */
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedForDetail(payroll)}
                className="h-8 px-2 text-xs text-primary hover:text-primary/90 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                {t('viewSlip')}
              </Button>
            )}
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
              <Banknote className="w-5 h-5" />
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
            onClick={() => setIsGenerateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('generateDraft')}
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
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
                  : selectedStatus === 'DRAFT'
                  ? t('statusDraft')
                  : selectedStatus === 'PROCESSED'
                  ? t('statusProcessed')
                  : selectedStatus === 'PAID'
                  ? t('statusPaid')
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{tCommon('allStatus')}</SelectItem>
              <SelectItem value="DRAFT">{t('statusDraft')}</SelectItem>
              <SelectItem value="PROCESSED">{t('statusProcessed')}</SelectItem>
              <SelectItem value="PAID">{t('statusPaid')}</SelectItem>
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

        {/* Period Range Picker */}
        <div className="w-64">
          <DateRangePicker
            from={periodStart}
            to={periodEnd}
            onChange={({ from, to }) => {
              setPeriodStart(from);
              setPeriodEnd(to);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            placeholder={t('period')}
            allowClear
          />
        </div>

        {(periodStart || periodEnd || selectedStatus !== 'ALL' || selectedDept !== 'ALL') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStatus('ALL');
              setSelectedDept('ALL');
              setPeriodStart('');
              setPeriodEnd('');
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
        data={payrolls}
        isLoading={isLoading || isPlaceholderData}
        totalRows={meta?.total}
        pageCount={meta?.totalPages}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={setPagination}
        emptyTitle={t('noPayrollRecords')}
        emptyDescription={t('noPayrollRecords')}
      />

      {/* Generate Payroll Dialog (HR Admin only) */}
      <PayrollGenerateDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
      />

      {/* Edit Payroll Dialog (DRAFT only) */}
      <PayrollEditDialog
        payroll={selectedForEdit}
        open={!!selectedForEdit}
        onOpenChange={(open) => !open && setSelectedForEdit(null)}
      />

      {/* Delete Payroll Dialog (DRAFT only) */}
      <PayrollDeleteDialog
        payroll={selectedForDelete}
        open={!!selectedForDelete}
        onOpenChange={(open) => !open && setSelectedForDelete(null)}
      />

      {/* Payslip Inspection Dialog */}
      <PayslipDialog
        payroll={selectedForDetail}
        open={!!selectedForDetail}
        onOpenChange={(open) => !open && setSelectedForDetail(null)}
      />
    </div>
  );
}

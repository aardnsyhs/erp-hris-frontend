'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  Plus,
  Send,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  MoreHorizontal,
  X,
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
import { StatusBadge } from '@/components/shared/status-badge';
import { PageHeader } from '@/components/shared/page-header';
import { MoneyValue } from '@/components/shared/money-value';
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

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const handleProcess = async (id: string) => {
    try {
      await processMutation.mutateAsync(id);
    } catch {
      // Handled by hook toast
    }
  };

  const handlePay = async (id: string) => {
    try {
      await payMutation.mutateAsync(id);
    } catch {
      // Handled by hook toast
    }
  };

  const resetFilters = () => {
    setSelectedStatus('ALL');
    setSelectedDept('ALL');
    setPeriodStart('');
    setPeriodEnd('');
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const hasActiveFilters =
    selectedStatus !== 'ALL' ||
    selectedDept !== 'ALL' ||
    periodStart !== '' ||
    periodEnd !== '';

  const columns: ColumnDef<Payroll>[] = [
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
      id: 'period',
      header: t('period'),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-foreground font-medium">
          {formatDate(row.original.periodStart)} – {formatDate(row.original.periodEnd)}
        </span>
      ),
    },
    {
      accessorKey: 'basicSalary',
      header: () => <div className="text-right">{t('basicSalary')}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <MoneyValue amount={row.original.basicSalary} />
        </div>
      ),
    },
    {
      accessorKey: 'netSalary',
      header: () => <div className="text-right font-bold">{t('netSalary')}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <MoneyValue amount={row.original.netSalary} className="font-bold text-xs" />
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: tCommon('status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: tCommon('actions'),
      cell: ({ row }) => {
        const payroll = row.original;
        const isDraft = payroll.status === 'DRAFT';
        const isProcessed = payroll.status === 'PROCESSED';

        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSelectedForDetail(payroll)}
              className="h-7 px-2 text-xs font-mono cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              {t('viewSlip')}
            </Button>

            {isHrAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={tNav('menuAction')}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground outline-none cursor-pointer"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 font-sans">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                      {tCommon('actions')}
                    </DropdownMenuLabel>

                    {isDraft && (
                      <DropdownMenuItem
                        onClick={() => handleProcess(payroll.id)}
                        disabled={processMutation.isPending}
                        className="flex items-center gap-2 cursor-pointer text-xs text-primary"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{t('processPayroll')}</span>
                      </DropdownMenuItem>
                    )}

                    {isProcessed && (
                      <DropdownMenuItem
                        onClick={() => handlePay(payroll.id)}
                        disabled={payMutation.isPending}
                        className="flex items-center gap-2 cursor-pointer text-xs text-[var(--status-success)]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{t('markAsPaid')}</span>
                      </DropdownMenuItem>
                    )}

                    {isDraft && (
                      <DropdownMenuItem
                        onClick={() => setSelectedForEdit(payroll)}
                        className="flex items-center gap-2 cursor-pointer text-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{t('editDraft')}</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>

                  {isDraft && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setSelectedForDelete(payroll)}
                        className="flex items-center gap-2 text-destructive cursor-pointer focus:bg-destructive/10 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{t('deleteDraft')}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
        description={t('subtitle')}
        actions={
          isHrAdmin && (
            <Button
              onClick={() => setIsGenerateOpen(true)}
              size="sm"
              className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-xs shrink-0 cursor-pointer font-medium text-xs h-8.5 rounded-md"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t('generateDraft')}
            </Button>
          )
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
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
            <SelectValue placeholder={tCommon('allStatus')}>
              {selectedStatus === 'ALL'
                ? tCommon('allStatus')
                : selectedStatus === 'DRAFT'
                ? t('statusDraft')
                : selectedStatus === 'PROCESSED'
                ? t('statusProcessed')
                : selectedStatus === 'PAID'
                ? t('statusPaid')
                : tCommon('allStatus')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">{tCommon('allStatus')}</SelectItem>
            <SelectItem value="DRAFT" className="text-xs">{t('statusDraft')}</SelectItem>
            <SelectItem value="PROCESSED" className="text-xs">{t('statusProcessed')}</SelectItem>
            <SelectItem value="PAID" className="text-xs">{t('statusPaid')}</SelectItem>
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
            <SelectTrigger className="w-[180px] h-8.5 text-xs bg-card border-border rounded-md font-mono">
              <SelectValue placeholder={tCommon('allDepartments')}>
                {selectedDept === 'ALL'
                  ? tCommon('allDepartments')
                  : departments.find((d) => d.id === selectedDept)?.name || tCommon('allDepartments')}
              </SelectValue>
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

        <div className="w-[240px]">
          <DateRangePicker
            from={periodStart}
            to={periodEnd}
            placeholder={t('period')}
            onChange={(range) => {
              setPeriodStart(range.from);
              setPeriodEnd(range.to);
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
        data={payrolls}
        isLoading={isLoading || isPlaceholderData}
        totalRows={meta?.total}
        pageCount={meta?.totalPages}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={setPagination}
        emptyTitle={t('noPayrollRecords')}
        emptyDescription={t('noPayrollRecords')}
      />

      {/* Generate Dialog */}
      <PayrollGenerateDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
      />

      {/* Edit Dialog */}
      <PayrollEditDialog
        payroll={selectedForEdit}
        open={!!selectedForEdit}
        onOpenChange={(open) => !open && setSelectedForEdit(null)}
      />

      {/* Delete Dialog */}
      <PayrollDeleteDialog
        payroll={selectedForDelete}
        open={!!selectedForDelete}
        onOpenChange={(open) => !open && setSelectedForDelete(null)}
      />

      {/* Payslip Modal */}
      <PayslipDialog
        payroll={selectedForDetail}
        open={!!selectedForDetail}
        onOpenChange={(open) => !open && setSelectedForDetail(null)}
      />
    </div>
  );
}

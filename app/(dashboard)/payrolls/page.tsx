'use client';

import React, { useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PayrollGenerateDialog } from '@/components/payroll/payroll-generate-dialog';
import { PayrollEditDialog } from '@/components/payroll/payroll-edit-dialog';
import { PayrollDeleteDialog } from '@/components/payroll/payroll-delete-dialog';
import { PayslipDialog } from '@/components/payroll/payslip-dialog';

export default function PayrollsPage() {
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
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const formatCurrency = (val?: string | number) => {
    if (val === undefined || val === null) return null;
    const num = Number(val);
    if (num < 0) {
      return `(Rp ${Math.abs(num).toLocaleString('id-ID')})`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status: PayrollStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Dibayar
          </Badge>
        );
      case 'PROCESSED':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[11px] gap-1">
            <Clock className="w-3 h-3" />
            Diproses
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[11px] gap-1">
            <Clock className="w-3 h-3" />
            Draft
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
      header: 'Periode Payroll',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-neutral-800 dark:text-neutral-200 font-medium">
          <span>{formatDate(row.original.periodStart)}</span>
          <span className="text-neutral-400">-</span>
          <span>{formatDate(row.original.periodEnd)}</span>
        </div>
      ),
    },
    ...(!isEmployee
      ? [
          {
            accessorKey: 'employee',
            header: 'Karyawan',
            cell: ({ row }: { row: { original: Payroll } }) => {
              const emp = row.original.employee;
              return (
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                    {emp?.fullName || '-'}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400">
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
      header: 'Gaji Bersih',
      cell: ({ row }) => {
        const net = row.original.netSalary;
        if (net === undefined) {
          return (
            <Badge variant="outline" className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[10px] gap-1">
              <ShieldCheck className="w-3 h-3 text-neutral-400" />
              Dilindungi
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
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-neutral-900 dark:text-neutral-100'
              }`}
            >
              {formatCurrency(net)}
            </span>
            {isNegative && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0 gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                Perlu Ditinjau
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'paymentDate',
      header: 'Tgl Bayar',
      cell: ({ row }) => (
        <span className="text-xs text-neutral-500 font-mono">
          {row.original.paymentDate ? formatDate(row.original.paymentDate) : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const payroll = row.original;
        const status = payroll.status;

        return (
          <div className="flex items-center justify-end gap-1.5">
            {isHrAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Menu aksi payroll"
                  className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 outline-none cursor-pointer"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-semibold text-neutral-400">
                      Tindakan Payroll
                    </DropdownMenuLabel>

                    {/* View Slip */}
                    <DropdownMenuItem
                      onClick={() => setSelectedForDetail(payroll)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span>Lihat Slip Gaji</span>
                    </DropdownMenuItem>

                    {/* Process Action (DRAFT -> PROCESSED) */}
                    {status === 'DRAFT' && (
                      <DropdownMenuItem
                        onClick={() => handleProcess(payroll)}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        <span>Proses Payroll</span>
                      </DropdownMenuItem>
                    )}

                    {/* Pay Action (PROCESSED -> PAID) */}
                    {status === 'PROCESSED' && (
                      <DropdownMenuItem
                        onClick={() => handlePay(payroll)}
                        className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Tandai Sudah Bayar</span>
                      </DropdownMenuItem>
                    )}

                    {/* Edit Action (DRAFT only) */}
                    {status === 'DRAFT' && (
                      <DropdownMenuItem
                        onClick={() => setSelectedForEdit(payroll)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                        <span>Edit Tunjangan/Potongan</span>
                      </DropdownMenuItem>
                    )}

                    {/* Delete Action (DRAFT only) */}
                    {status === 'DRAFT' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSelectedForDelete(payroll)}
                          className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Hapus Draft</span>
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
                className="h-8 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Slip Gaji
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
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <Banknote className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Penggajian & Slip Gaji
            </h1>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isHrAdmin
              ? 'Kelola pembuatan draft payroll, pemrosesan gaji, dan pencatatan pembayaran gaji karyawan.'
              : isEmployee
              ? 'Lihat dan unduh riwayat rincian slip gaji bulanan Anda.'
              : 'Pantau status pemrosesan payroll karyawan dalam departemen Anda.'}
          </p>
        </div>

        {isHrAdmin && (
          <Button
            onClick={() => setIsGenerateOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Draft Payroll
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
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
            <SelectTrigger className="h-9 text-xs w-full">
              <SelectValue placeholder="Semua Status">
                {selectedStatus === 'ALL'
                  ? 'Semua Status'
                  : selectedStatus === 'DRAFT'
                  ? 'Draft'
                  : selectedStatus === 'PROCESSED'
                  ? 'Diproses'
                  : selectedStatus === 'PAID'
                  ? 'Dibayar'
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="DRAFT">Draft (DRAFT)</SelectItem>
              <SelectItem value="PROCESSED">Diproses (PROCESSED)</SelectItem>
              <SelectItem value="PAID">Dibayar (PAID)</SelectItem>
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
              <SelectTrigger className="h-9 text-xs w-full">
                <SelectValue placeholder="Semua Departemen">
                  {selectedDept === 'ALL'
                    ? 'Semua Departemen'
                    : departments.find((d) => d.id === selectedDept)?.name || 'Semua Departemen'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Departemen</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Period Start */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-400">Periode:</span>
          <Input
            type="date"
            value={periodStart}
            onChange={(e) => {
              setPeriodStart(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-9 text-xs w-36"
          />
        </div>

        {/* Period End */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-400">s/d:</span>
          <Input
            type="date"
            value={periodEnd}
            onChange={(e) => {
              setPeriodEnd(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-9 text-xs w-36"
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
            className="text-xs text-neutral-500 h-9"
          >
            Reset Filter
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
        emptyTitle="Belum Ada Data Payroll"
        emptyDescription="Tidak ada data payroll yang sesuai dengan kriteria filter saat ini."
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

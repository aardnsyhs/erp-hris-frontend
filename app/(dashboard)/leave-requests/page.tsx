'use client';

import React, { useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    return new Intl.DateTimeFormat('id-ID', {
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
          <Badge variant="outline" className="bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[11px]">
            Tahunan
          </Badge>
        );
      case 'SICK':
        return (
          <Badge variant="outline" className="bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px]">
            Sakit
          </Badge>
        );
      case 'MATERNITY':
        return (
          <Badge variant="outline" className="bg-purple-50/60 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[11px]">
            Melahirkan
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px]">
            Tanpa Gaji
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
            Disetujui
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="text-[11px] gap-1">
            <XCircle className="w-3 h-3" />
            Ditolak
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[11px] gap-1">
            <Clock className="w-3 h-3" />
            Menunggu
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
            header: 'Karyawan',
            cell: ({ row }: { row: { original: LeaveRequest } }) => {
              const emp = row.original.employee;
              const isSelf = emp?.id === currentEmployeeId;
              return (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                      {emp?.fullName || '-'}
                    </span>
                    {isSelf && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 bg-neutral-100 dark:bg-neutral-800">
                        Saya
                      </Badge>
                    )}
                  </div>
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
      accessorKey: 'leaveType',
      header: 'Tipe Cuti',
      cell: ({ row }) => getLeaveTypeBadge(row.original.leaveType),
    },
    {
      id: 'period',
      header: 'Periode Cuti',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-neutral-800 dark:text-neutral-200">
          <span>{formatDate(row.original.startDate)}</span>
          <span className="text-neutral-400">-</span>
          <span>{formatDate(row.original.endDate)}</span>
        </div>
      ),
    },
    {
      id: 'duration',
      header: 'Durasi',
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {calculateDays(row.original.startDate, row.original.endDate)} hari
        </span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Alasan',
      cell: ({ row }) => (
        <span className="text-xs text-neutral-500 truncate max-w-48 block">
          {row.original.reason}
        </span>
      ),
    },
    ...(!isPendingTab
      ? [
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }: { row: { original: LeaveRequest } }) =>
              getStatusBadge(row.original.status),
          },
        ]
      : []),
    {
      id: 'actions',
      header: () => <div className="text-right">Aksi</div>,
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
                    <TooltipTrigger>
                      <span className="inline-block">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled
                          className="h-8 px-2 text-neutral-400 opacity-50 cursor-not-allowed"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Setujui
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      Anda tidak dapat menyetujui pengajuan cuti Anda sendiri.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(leave)}
                    disabled={approveMutation.isPending}
                    className="h-8 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Setujui
                  </Button>
                )}

                {isSelf ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-block">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled
                          className="h-8 px-2 text-neutral-400 opacity-50 cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Tolak
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      Anda tidak dapat menolak pengajuan cuti Anda sendiri.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedForReject(leave)}
                    className="h-8 px-2.5 text-xs text-red-600 dark:text-red-400 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Tolak
                  </Button>
                )}
              </>
            )}

            {/* View Detail Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedForDetail(leave)}
              className="h-8 px-2 text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Detail
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
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Pengajuan Cuti (Leave Requests)
            </h1>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isApproverRole
              ? 'Kelola pengajuan cuti tim dan pantau riwayat persetujuan kehadiran.'
              : 'Ajukan permohonan cuti dan pantau status persetujuan atasan.'}
          </p>
        </div>

        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajukan Cuti Baru
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
            <TabsTrigger value="PENDING_APPROVALS" className="gap-2">
              <Clock className="w-4 h-4" />
              Perlu Persetujuan
            </TabsTrigger>
            <TabsTrigger value="ALL_HISTORY" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Semua Riwayat Cuti
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Filter Toolbar (Rendered on History view) */}
      {(!isApproverRole || activeTab === 'ALL_HISTORY') && (
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
                    : selectedStatus === 'PENDING'
                    ? 'Menunggu'
                    : selectedStatus === 'APPROVED'
                    ? 'Disetujui'
                    : selectedStatus === 'REJECTED'
                    ? 'Ditolak'
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="PENDING">Menunggu (PENDING)</SelectItem>
                <SelectItem value="APPROVED">Disetujui (APPROVED)</SelectItem>
                <SelectItem value="REJECTED">Ditolak (REJECTED)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leave Type Filter */}
          <div className="w-44">
            <Select
              value={selectedLeaveType}
              onValueChange={(val) => {
                if (val) {
                  setSelectedLeaveType(val);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }
              }}
            >
              <SelectTrigger className="h-9 text-xs w-full">
                <SelectValue placeholder="Semua Tipe Cuti">
                  {selectedLeaveType === 'ALL'
                    ? 'Semua Tipe Cuti'
                    : selectedLeaveType === 'ANNUAL'
                    ? 'Cuti Tahunan'
                    : selectedLeaveType === 'SICK'
                    ? 'Cuti Sakit'
                    : selectedLeaveType === 'UNPAID'
                    ? 'Tanpa Gaji'
                    : selectedLeaveType === 'MATERNITY'
                    ? 'Melahirkan'
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Tipe Cuti</SelectItem>
                <SelectItem value="ANNUAL">Cuti Tahunan</SelectItem>
                <SelectItem value="SICK">Cuti Sakit</SelectItem>
                <SelectItem value="UNPAID">Cuti Tanpa Gaji</SelectItem>
                <SelectItem value="MATERNITY">Cuti Melahirkan</SelectItem>
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

          {/* Start Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Dari:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="h-9 text-xs w-36"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Sampai:</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="h-9 text-xs w-36"
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
              className="text-xs text-neutral-500 h-9"
            >
              Reset Filter
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
        emptyTitle={
          isPendingTab
            ? 'Tidak Ada Pengajuan Menunggu'
            : 'Belum Ada Permohonan Cuti'
        }
        emptyDescription={
          isPendingTab
            ? 'Semua permohonan cuti dari anggota tim telah selesai diproses.'
            : 'Tidak ada data permohonan cuti yang sesuai dengan kriteria filter.'
        }
      />

      {/* Form Submission Dialog */}
      <LeaveRequestFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      {/* Rejection Dialog */}
      <LeaveRejectDialog
        leaveRequest={selectedForReject}
        open={!!selectedForReject}
        onOpenChange={(open) => !open && setSelectedForReject(null)}
      />

      {/* Detail Inspection Dialog */}
      <LeaveDetailDialog
        leaveRequest={selectedForDetail}
        open={!!selectedForDetail}
        onOpenChange={(open) => !open && setSelectedForDetail(null)}
      />
    </div>
  );
}

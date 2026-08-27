'use client';

import React, { useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AttendanceWidget } from '@/components/attendance/attendance-widget';
import { WorkScheduleDialog } from '@/components/attendance/work-schedule-dialog';

export default function AttendancesPage() {
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
    return new Intl.DateTimeFormat('id-ID', {
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
    return new Intl.DateTimeFormat('id-ID', {
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
    if (h === 0) return `${m}m`;
    return `${h}j ${m > 0 ? `${m}m` : ''}`;
  };

  // Table Columns Definition
  const columns: ColumnDef<Attendance>[] = [
    {
      accessorKey: 'attendanceDate',
      header: 'Tanggal',
      cell: ({ row }) => (
        <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200">
          {formatDate(row.original.attendanceDate)}
        </span>
      ),
    },
    ...(!isEmployee
      ? [
          {
            accessorKey: 'employee',
            header: 'Karyawan',
            cell: ({ row }: { row: { original: Attendance } }) => {
              const emp = row.original.employee;
              return (
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                    {emp?.fullName || '-'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
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
      header: 'Jam Masuk',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
          {formatTime(row.original.checkIn)}
        </span>
      ),
    },
    {
      accessorKey: 'checkOut',
      header: 'Jam Pulang',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
          {formatTime(row.original.checkOut)}
        </span>
      ),
    },
    {
      id: 'duration',
      header: 'Total Durasi',
      cell: ({ row }) => (
        <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          {formatDuration(row.original.checkIn, row.original.checkOut)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'PRESENT') {
          return (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Tepat Waktu
            </Badge>
          );
        }
        if (status === 'LATE') {
          return (
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] gap-1">
              <AlertTriangle className="w-3 h-3" />
              Terlambat
            </Badge>
          );
        }
        return (
          <Badge variant="destructive" className="text-[11px] gap-1">
            <XCircle className="w-3 h-3" />
            Tidak Hadir
          </Badge>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: 'Catatan',
      cell: ({ row }) => {
        const notes = row.original.notes;
        return (
          <span className="text-xs text-neutral-500 truncate max-w-[200px] block">
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
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <Clock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Presensi & Kehadiran
            </h1>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isEmployee
              ? 'Lakukan check-in/out harian dan pantau riwayat kehadiran Anda.'
              : isManager
              ? 'Pantau catatan absensi, keterlambatan, dan jam kerja anggota tim Anda.'
              : 'Manajemen pencatatan kehadiran karyawan dan konfigurasi jadwal kerja perusahaan.'}
          </p>
        </div>

        {isHrAdmin && (
          <Button
            variant="outline"
            onClick={() => setIsScheduleOpen(true)}
            className="border-neutral-300 dark:border-neutral-700 shrink-0"
          >
            <Settings className="w-4 h-4 mr-2 text-neutral-500" />
            Jadwal Kerja
          </Button>
        )}
      </div>

      {/* Real-Time Attendance Action Widget */}
      <AttendanceWidget />

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
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
            <SelectTrigger className="h-9 text-xs w-full">
              <SelectValue placeholder="Semua Status">
                {selectedStatus === 'ALL'
                  ? 'Semua Status'
                  : selectedStatus === 'PRESENT'
                  ? 'Tepat Waktu'
                  : selectedStatus === 'LATE'
                  ? 'Terlambat'
                  : selectedStatus === 'ABSENT'
                  ? 'Tidak Hadir'
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PRESENT">Tepat Waktu (PRESENT)</SelectItem>
              <SelectItem value="LATE">Terlambat (LATE)</SelectItem>
              <SelectItem value="ABSENT">Tidak Hadir (ABSENT)</SelectItem>
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
            className="text-xs text-neutral-500 h-9"
          >
            Reset Filter
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
        emptyTitle="Belum Ada Riwayat Absensi"
        emptyDescription="Tidak ada data absensi yang tercatat untuk filter periode atau status ini."
      />

      {/* Work Schedule Dialog (HR_ADMIN only) */}
      <WorkScheduleDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
      />
    </div>
  );
}

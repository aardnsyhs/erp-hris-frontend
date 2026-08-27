'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import {
  Users,
  Plus,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Building2,
  Filter,
  RefreshCw,
  UserX,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEmployees } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import { Employee, EmployeeStatus } from '@/types/employee';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeFormDialog } from '@/components/employees/employee-form-dialog';
import { EmployeeDeleteDialog } from '@/components/employees/employee-delete-dialog';
import { EmployeeTerminateDialog } from '@/components/employees/employee-terminate-dialog';
import { EmployeeReactivateDialog } from '@/components/employees/employee-reactivate-dialog';

export default function EmployeesPage() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [employeeToTerminate, setEmployeeToTerminate] =
    useState<Employee | null>(null);
  const [employeeToReactivate, setEmployeeToReactivate] =
    useState<Employee | null>(null);

  // Queries
  const { data: departmentsData } = useDepartments();
  const departments = departmentsData?.data || [];

  const { data, isLoading, isPlaceholderData } = useEmployees({
    page: pageIndex + 1,
    limit: pageSize,
    search: search.trim() || undefined,
    departmentId: selectedDept !== 'ALL' ? selectedDept : undefined,
    status: selectedStatus !== 'ALL' ? (selectedStatus as EmployeeStatus) : undefined,
  });

  const employees = data?.data || [];
  const meta = data?.meta;

  const handleCreateClick = () => {
    setEmployeeToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
  };

  // Table Columns Definition
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'nip',
      header: 'NIP',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
          {row.original.nip}
        </span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Nama Karyawan',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/employees/${row.original.id}`}
            className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
          >
            {row.original.fullName}
          </Link>
          <span className="text-xs text-neutral-400">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Departemen',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>{row.original.department?.name || '-'}</span>
          {row.original.department?.code && (
            <span className="text-[10px] text-neutral-400 font-mono">
              ({row.original.department.code})
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'jobTitle',
      header: 'Jabatan',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {row.original.jobTitle}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;

        if (status === 'INACTIVE') {
          return (
            <Badge
              variant="outline"
              className="text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
            >
              Nonaktif (Sementara)
            </Badge>
          );
        }

        if (status === 'TERMINATED') {
          return (
            <Badge variant="destructive" className="text-[11px] bg-rose-600 dark:bg-rose-700">
              Diberhentikan (Permanen)
            </Badge>
          );
        }

        return (
          <Badge className="text-[11px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Aktif
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Menu aksi karyawan"
              className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 outline-none cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold text-neutral-400">
                  Pilihan Tindakan
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/employees/${emp.id}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-neutral-500" />
                  <span>Lihat Profil</span>
                </DropdownMenuItem>

                {isHrAdmin && (
                  <>
                    {emp.status === 'ACTIVE' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleEditClick(emp)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4 text-blue-500" />
                          <span>Edit Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(emp)}
                          className="flex items-center gap-2 text-amber-600 dark:text-amber-400 cursor-pointer focus:bg-amber-50 dark:focus:bg-amber-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Nonaktifkan (Sementara)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEmployeeToTerminate(emp)}
                          className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/40"
                        >
                          <UserX className="h-4 w-4" />
                          <span>Berhentikan (Permanen)</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {emp.status === 'INACTIVE' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setEmployeeToReactivate(emp)}
                          className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/40"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Aktifkan Kembali</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEmployeeToTerminate(emp)}
                          className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/40"
                        >
                          <UserX className="h-4 w-4" />
                          <span>Berhentikan (Permanen)</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {currentUser?.role === 'MANAGER' ? 'Daftar Anggota Tim' : 'Direktori Karyawan'}
            </h1>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {currentUser?.role === 'MANAGER'
              ? 'Pantau profil dan keanggotaan karyawan dalam departemen Anda.'
              : 'Manajemen data profil, nomor induk pegawai (NIP), departemen, dan status kerja.'}
          </p>
        </div>

        {isHrAdmin && (
          <Button
            onClick={handleCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Karyawan
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>

        {/* Department Filter (Only useful if multiple depts visible, e.g. HR_ADMIN) */}
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
                  : selectedStatus === 'ACTIVE'
                  ? 'Aktif (ACTIVE)'
                  : selectedStatus === 'INACTIVE'
                  ? 'Nonaktif (INACTIVE)'
                  : selectedStatus === 'TERMINATED'
                  ? 'Diberhentikan'
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">Aktif (ACTIVE)</SelectItem>
              <SelectItem value="INACTIVE">Nonaktif (INACTIVE)</SelectItem>
              <SelectItem value="TERMINATED">Diberhentikan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading || isPlaceholderData}
        totalRows={meta?.total}
        pageCount={meta?.totalPages}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={setPagination}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
        searchPlaceholder="Cari nama, NIP, email, jabatan..."
        emptyTitle="Karyawan Tidak Ditemukan"
        emptyDescription="Tidak ada data karyawan yang sesuai dengan kriteria pencarian atau filter aktif."
      />

      {/* Form Dialog (Create / Edit) */}
      <EmployeeFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        employeeToEdit={employeeToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <EmployeeDeleteDialog
        open={!!employeeToDelete}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
        employee={employeeToDelete}
      />

      {/* Terminate Confirmation Dialog */}
      <EmployeeTerminateDialog
        open={!!employeeToTerminate}
        onOpenChange={(open) => !open && setEmployeeToTerminate(null)}
        employee={employeeToTerminate}
      />

      {/* Reactivate Confirmation Dialog */}
      <EmployeeReactivateDialog
        open={!!employeeToReactivate}
        onOpenChange={(open) => !open && setEmployeeToReactivate(null)}
        employee={employeeToReactivate}
      />
    </div>
  );
}

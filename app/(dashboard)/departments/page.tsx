'use client';

import React, { useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import {
  Building2,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Users,
  Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useDepartments } from '@/hooks/use-departments';
import { Department } from '@/types/department';
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DepartmentFormDialog } from '@/components/departments/department-form-dialog';
import { DepartmentDeleteDialog } from '@/components/departments/department-delete-dialog';

export default function DepartmentsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  const { data, isLoading, isPlaceholderData } = useDepartments({
    page: pageIndex + 1,
    limit: pageSize,
    search: search.trim() || undefined,
  });

  const departments = data?.data || [];
  const meta = data?.meta;

  const handleCreateClick = () => {
    setDeptToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (dept: Department) => {
    setDeptToEdit(dept);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (dept: Department) => {
    setDeptToDelete(dept);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  // Table Columns Definition
  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'code',
      header: 'Kode Departemen',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nama Departemen',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-neutral-400 shrink-0" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: '_count.employees',
      header: 'Karyawan Terdaftar',
      cell: ({ row }) => {
        const count = row.original._count?.employees ?? 0;
        return (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={
                count > 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400'
              }
            >
              <Users className="w-3 h-3 mr-1" />
              {count} Karyawan
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Tanggal Dibuat',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const dept = row.original;
        const employeeCount = dept._count?.employees ?? 0;
        const hasEmployees = employeeCount > 0;

        if (!isHrAdmin) {
          return (
            <span className="text-xs text-neutral-400 italic">Read-only</span>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Menu aksi departemen"
              className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 outline-none cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold text-neutral-400">
                  Pilihan Tindakan
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleEditClick(dept)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 text-blue-500" />
                  <span>Edit Departemen</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {hasEmployees ? (
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <DropdownMenuItem
                        disabled
                        className="flex items-center gap-2 text-neutral-400 opacity-50 cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Hapus Departemen</span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      Tidak dapat dihapus, masih ada {employeeCount} karyawan terdaftar.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(dept)}
                    className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus Departemen</span>
                  </DropdownMenuItem>
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
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Struktur Departemen
            </h1>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manajemen unit divisi, kode referensi, dan alokasi karyawan pada organisasi.
          </p>
        </div>

        {isHrAdmin && (
          <Button
            onClick={handleCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Departemen
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={departments}
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
        searchPlaceholder="Cari kode atau nama departemen..."
        emptyTitle="Departemen Tidak Ditemukan"
        emptyDescription="Belum ada departemen yang sesuai dengan kata kunci pencarian Anda."
      />

      {/* Form Dialog (Create / Edit) */}
      <DepartmentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        departmentToEdit={deptToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DepartmentDeleteDialog
        open={!!deptToDelete}
        onOpenChange={(open) => !open && setDeptToDelete(null)}
        department={deptToDelete}
      />
    </div>
  );
}

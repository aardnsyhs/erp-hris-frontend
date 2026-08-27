'use client';

import React, { useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
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
  const t = useTranslations('departments');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  const locale = useLocale();

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
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  // Table Columns Definition
  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'code',
      header: t('code'),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-foreground text-sm">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: '_count.employees',
      header: t('employeeCount'),
      cell: ({ row }) => {
        const count = row.original._count?.employees ?? 0;
        return (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={
                count > 0
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-muted text-muted-foreground'
              }
            >
              <Users className="w-3 h-3 mr-1" />
              {count}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: tCommon('status'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: tCommon('actions'),
      cell: ({ row }) => {
        const dept = row.original;
        const employeeCount = dept._count?.employees ?? 0;
        const hasEmployees = employeeCount > 0;

        if (!isHrAdmin) {
          return (
            <span className="text-xs text-muted-foreground italic">Read-only</span>
          );
        }

        return (
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
                <DropdownMenuItem
                  onClick={() => handleEditClick(dept)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 text-primary" />
                  <span>{t('editDepartment')}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {hasEmployees ? (
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <DropdownMenuItem
                        disabled
                        className="flex items-center gap-2 text-muted-foreground opacity-50 cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{t('deleteDepartment')}</span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      {t('deleteWarningHasEmployees', { count: employeeCount })}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(dept)}
                    className="flex items-center gap-2 text-destructive cursor-pointer focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('deleteDepartment')}</span>
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
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
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
            onClick={handleCreateClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addDepartment')}
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
        searchPlaceholder={t('searchPlaceholder')}
        emptyTitle={t('noDepartmentsFound')}
        emptyDescription={t('noDepartmentsFound')}
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

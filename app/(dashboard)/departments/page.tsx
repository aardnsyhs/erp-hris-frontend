'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { PageHeader } from '@/components/shared/page-header';
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
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <div className="flex flex-col min-w-0">
          <Link
            href={`/employees?departmentId=${row.original.id}`}
            className="font-semibold text-foreground text-xs hover:text-primary hover:underline transition-colors truncate"
          >
            {row.original.name}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: '_count.employees',
      header: t('employeeCount'),
      cell: ({ row }) => {
        const count = row.original._count?.employees ?? 0;
        return (
          <Link
            href={`/employees?departmentId=${row.original.id}`}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium tabular-nums text-foreground">{t('headcount', { count })}</span>
          </Link>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: t('registeredDate'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
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
            <span className="text-xs text-muted-foreground italic">{tCommon('readOnly')}</span>
          );
        }

        return (
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
                <DropdownMenuItem
                  onClick={() => handleEditClick(dept)}
                  className="flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5 text-primary" />
                  <span>{t('editDepartment')}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(dept)}
                  disabled={hasEmployees}
                  className="flex items-center gap-2 text-destructive cursor-pointer focus:bg-destructive/10 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{tCommon('delete')}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
        badge={
          meta?.total !== undefined ? (
            <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
              {t('totalUnits', { count: meta.total })}
            </Badge>
          ) : undefined
        }
        actions={
          isHrAdmin && (
            <Button
              onClick={handleCreateClick}
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs shrink-0 cursor-pointer font-medium text-xs h-8.5 rounded-md"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t('addDepartment')}
            </Button>
          )
        }
      />

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

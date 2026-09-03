'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  Plus,
  MoreHorizontal,
  Edit2,
  Users,
  Calendar,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useDepartments } from '@/hooks/use-departments';
import { Department, DepartmentStatus } from '@/types/department';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DepartmentFormDialog } from '@/components/departments/department-form-dialog';
import { DepartmentArchiveDialog } from '@/components/departments/department-archive-dialog';
import { DepartmentRestoreDialog } from '@/components/departments/department-restore-dialog';

export default function DepartmentsPage() {
  const t = useTranslations('departments');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  const locale = useLocale();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';

  // Filters & Pagination State
  const [selectedStatus, setSelectedStatus] = useState<DepartmentStatus>('ACTIVE');
  const [search, setSearch] = useState('');
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);
  const [deptToArchive, setDeptToArchive] = useState<Department | null>(null);
  const [deptToRestore, setDeptToRestore] = useState<Department | null>(null);

  const { data, isLoading, isPlaceholderData } = useDepartments({
    page: pageIndex + 1,
    limit: pageSize,
    search: search.trim() || undefined,
    status: selectedStatus,
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

  const handleArchiveClick = (dept: Department) => {
    setDeptToArchive(dept);
  };

  const handleRestoreClick = (dept: Department) => {
    setDeptToRestore(dept);
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
      accessorKey: 'isActive',
      header: t('status'),
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return isActive ? (
          <Badge
            variant="outline"
            className="text-[11px] font-mono px-2 py-0.5 text-status-success border-(--status-success)/40 bg-status-success-bg gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block" />
            {t('statusActive')}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[11px] font-mono px-2 py-0.5 text-status-warning border-(--status-warning)/40 bg-status-warning-bg gap-1.5"
          >
            <Archive className="w-3 h-3 text-status-warning" />
            {t('statusArchived')}
          </Badge>
        );
      },
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
                {dept.isActive ? (
                  <DropdownMenuItem
                    onClick={() => handleArchiveClick(dept)}
                    className="flex items-center gap-2 text-status-warning cursor-pointer focus:bg-status-warning-bg text-xs"
                  >
                    <Archive className="h-3.5 w-3.5 text-status-warning" />
                    <span>{t('archiveDepartment')}</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleRestoreClick(dept)}
                    className="flex items-center gap-2 text-status-success cursor-pointer focus:bg-status-success-bg text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-status-success" />
                    <span>{t('restoreDepartment')}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const emptyTitle = search.trim()
    ? t('noDepartmentsFound')
    : selectedStatus === 'ARCHIVED'
    ? t('noArchivedDepartmentsFound')
    : t('noActiveDepartmentsFound');

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

      {/* Tabs Filter for Department Lifecycle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs
          value={selectedStatus}
          onValueChange={(val) => {
            if (val) {
              setSelectedStatus(val as DepartmentStatus);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }
          }}
        >
          <TabsList className="bg-muted p-1 h-9">
            <TabsTrigger value="ACTIVE" className="text-xs font-medium cursor-pointer px-3">
              {t('tabActive')}
            </TabsTrigger>
            <TabsTrigger value="ARCHIVED" className="text-xs font-medium cursor-pointer px-3">
              {t('tabArchived')}
            </TabsTrigger>
            <TabsTrigger value="ALL" className="text-xs font-medium cursor-pointer px-3">
              {t('tabAll')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
        emptyTitle={emptyTitle}
        emptyDescription={emptyTitle}
      />

      {/* Form Dialog (Create / Edit) */}
      <DepartmentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        departmentToEdit={deptToEdit}
      />

      {/* Archive Confirmation Dialog */}
      <DepartmentArchiveDialog
        open={!!deptToArchive}
        onOpenChange={(open) => !open && setDeptToArchive(null)}
        department={deptToArchive}
      />

      {/* Restore Confirmation Dialog */}
      <DepartmentRestoreDialog
        open={!!deptToRestore}
        onOpenChange={(open) => !open && setDeptToRestore(null)}
        department={deptToRestore}
      />
    </div>
  );
}

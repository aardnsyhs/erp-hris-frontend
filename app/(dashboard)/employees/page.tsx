'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  Users,
  Plus,
  MoreHorizontal,
  Eye,
  Edit2,
  RotateCcw,
  UserMinus,
  UserX,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEmployees } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import { Employee, EmployeeStatus } from '@/types/employee';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
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
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
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

  const handleTerminateClick = (employee: Employee) => {
    setEmployeeToTerminate(employee);
  };

  const handleReactivateClick = (employee: Employee) => {
    setEmployeeToReactivate(employee);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedDept('ALL');
    setSelectedStatus('ALL');
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const hasActiveFilters = search !== '' || selectedDept !== 'ALL' || selectedStatus !== 'ALL';

  // Columns definition
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'nip',
      header: t('nip'),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.original.nip}
        </span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: t('fullName'),
      cell: ({ row }) => (
        <div className="flex flex-col min-w-0">
          <Link
            href={`/employees/${row.original.id}`}
            className="font-semibold text-foreground text-xs hover:text-primary hover:underline transition-colors truncate"
          >
            {row.original.fullName}
          </Link>
          <span className="text-[11px] font-mono text-muted-foreground truncate">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'department.name',
      header: t('department'),
      cell: ({ row }) => (
        <span className="text-xs text-foreground font-medium truncate block max-w-40">
          {row.original.department?.name || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'jobTitle',
      header: t('jobTitle'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground truncate block max-w-40">
          {row.original.jobTitle || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: tCommon('actions'),
      cell: ({ row }) => {
        const emp = row.original;
        const canReactivate = emp.status === 'INACTIVE';
        const canDeactivate = emp.status === 'ACTIVE';
        const canTerminate = emp.status === 'ACTIVE' || emp.status === 'INACTIVE';
        const canEdit = isHrAdmin && emp.status !== 'TERMINATED';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={tNav('menuAction')}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 font-sans">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  {tCommon('actions')}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/employees/${emp.id}`)}
                  className="flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{tCommon('detail')}</span>
                </DropdownMenuItem>

                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => handleEditClick(emp)}
                    className="flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-primary" />
                    <span>{t('editEmployee')}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              {isHrAdmin && (canReactivate || canDeactivate || canTerminate) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {canReactivate && (
                      <DropdownMenuItem
                        onClick={() => handleReactivateClick(emp)}
                        className="flex items-center gap-2 cursor-pointer text-xs text-[var(--status-success)] focus:bg-[var(--status-success-bg)]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>{t('reactivate')}</span>
                      </DropdownMenuItem>
                    )}

                    {canDeactivate && (
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(emp)}
                        className="flex items-center gap-2 cursor-pointer text-xs text-[var(--status-warning)] focus:bg-[var(--status-warning-bg)]"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        <span>{t('deactivate')}</span>
                      </DropdownMenuItem>
                    )}

                    {canTerminate && (
                      <DropdownMenuItem
                        onClick={() => handleTerminateClick(emp)}
                        className="flex items-center gap-2 text-destructive cursor-pointer focus:bg-destructive/10 text-xs"
                      >
                        <UserX className="h-3.5 w-3.5" />
                        <span>{t('terminate')}</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </>
              )}
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
              {t('totalCount', { count: meta.total })}
            </Badge>
          ) : undefined
        }
        actions={
          isHrAdmin && (
            <Button
              onClick={handleCreateClick}
              size="sm"
              className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-xs shrink-0 cursor-pointer font-medium text-xs h-8.5 rounded-md"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t('addEmployee')}
            </Button>
          )
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
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
            <SelectValue placeholder={tCommon('allDepartments')} />
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
            <SelectValue placeholder={tCommon('allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">{tCommon('allStatus')}</SelectItem>
            <SelectItem value="ACTIVE" className="text-xs">{t('statusActive')}</SelectItem>
            <SelectItem value="INACTIVE" className="text-xs">{t('statusInactive')}</SelectItem>
            <SelectItem value="TERMINATED" className="text-xs">{t('statusTerminated')}</SelectItem>
          </SelectContent>
        </Select>

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

      {/* Directory Data Table */}
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
        searchPlaceholder={t('searchPlaceholder')}
        emptyTitle={t('noEmployeesFound')}
        emptyDescription={t('noEmployeesFound')}
      />

      {/* Form Dialog (Create / Edit) */}
      <EmployeeFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        employeeToEdit={employeeToEdit}
      />

      {/* Deletion Dialog */}
      <EmployeeDeleteDialog
        open={!!employeeToDelete}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
        employee={employeeToDelete}
      />

      {/* Termination Dialog */}
      <EmployeeTerminateDialog
        open={!!employeeToTerminate}
        onOpenChange={(open) => !open && setEmployeeToTerminate(null)}
        employee={employeeToTerminate}
      />

      {/* Reactivation Dialog */}
      <EmployeeReactivateDialog
        open={!!employeeToReactivate}
        onOpenChange={(open) => !open && setEmployeeToReactivate(null)}
        employee={employeeToReactivate}
      />
    </div>
  );
}

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

  // Table Columns Definition
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'nip',
      header: t('nip'),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
          {row.original.nip}
        </span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: t('fullName'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/employees/${row.original.id}`}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {row.original.fullName}
          </Link>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: t('department'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{row.original.department?.name || '-'}</span>
          {row.original.department?.code && (
            <span className="text-[10px] text-muted-foreground font-mono">
              ({row.original.department.code})
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'jobTitle',
      header: t('jobTitle'),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {row.original.jobTitle}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: tCommon('status'),
      cell: ({ row }) => {
        const status = row.original.status;

        if (status === 'INACTIVE') {
          return (
            <Badge
              variant="outline"
              className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            >
              {t('statusInactive')}
            </Badge>
          );
        }

        if (status === 'TERMINATED') {
          return (
            <Badge variant="destructive" className="text-[11px]">
              {t('statusTerminated')}
            </Badge>
          );
        }

        return (
          <Badge className="text-[11px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            {t('statusActive')}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: tCommon('actions'),
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={tNav('menuAction')}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  {tCommon('actions')}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/employees/${emp.id}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{tCommon('detail')}</span>
                </DropdownMenuItem>

                {isHrAdmin && (
                  <>
                    {emp.status === 'ACTIVE' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleEditClick(emp)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4 text-primary" />
                          <span>{tCommon('edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(emp)}
                          className="flex items-center gap-2 text-amber-600 dark:text-amber-400 cursor-pointer focus:bg-amber-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{t('deactivateTitle')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEmployeeToTerminate(emp)}
                          className="flex items-center gap-2 text-destructive cursor-pointer focus:bg-destructive/10"
                        >
                          <UserX className="h-4 w-4" />
                          <span>{t('terminate')}</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {emp.status === 'INACTIVE' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setEmployeeToReactivate(emp)}
                          className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 cursor-pointer focus:bg-emerald-500/10"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>{t('reactivate')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEmployeeToTerminate(emp)}
                          className="flex items-center gap-2 text-destructive cursor-pointer focus:bg-destructive/10"
                        >
                          <UserX className="h-4 w-4" />
                          <span>{t('terminate')}</span>
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
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
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
            {t('addEmployee')}
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>{tCommon('filter')}:</span>
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
              <SelectTrigger className="h-9 text-xs w-full bg-card">
                <SelectValue placeholder={tCommon('allDepartments')}>
                  {selectedDept === 'ALL'
                    ? tCommon('allDepartments')
                    : departments.find((d) => d.id === selectedDept)?.name || tCommon('allDepartments')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tCommon('allDepartments')}</SelectItem>
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
            <SelectTrigger className="h-9 text-xs w-full bg-card">
              <SelectValue placeholder={tCommon('allStatus')}>
                {selectedStatus === 'ALL'
                  ? tCommon('allStatus')
                  : selectedStatus === 'ACTIVE'
                  ? t('statusActive')
                  : selectedStatus === 'INACTIVE'
                  ? t('statusInactive')
                  : selectedStatus === 'TERMINATED'
                  ? t('statusTerminated')
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{tCommon('allStatus')}</SelectItem>
              <SelectItem value="ACTIVE">{t('statusActive')}</SelectItem>
              <SelectItem value="INACTIVE">{t('statusInactive')}</SelectItem>
              <SelectItem value="TERMINATED">{t('statusTerminated')}</SelectItem>
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

'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  Shield,
  User,
  Edit2,
  RotateCcw,
  UserMinus,
  UserX,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEmployee } from '@/hooks/use-employees';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { DetailSection, DetailGridItem } from '@/components/shared/detail-layout';
import { MoneyValue } from '@/components/shared/money-value';
import { AuditMeta } from '@/components/shared/audit-meta';
import { EmployeeFormDialog } from '@/components/employees/employee-form-dialog';
import { EmployeeDeleteDialog } from '@/components/employees/employee-delete-dialog';
import { EmployeeReactivateDialog } from '@/components/employees/employee-reactivate-dialog';
import { EmployeeTerminateDialog } from '@/components/employees/employee-terminate-dialog';
import { cn } from '@/lib/utils';
import { Employee } from '@/types/employee';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const tPayroll = useTranslations('payroll');
  const locale = useLocale();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isReactivateOpen, setIsReactivateOpen] = useState(false);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);

  const { data: employee, isLoading, isError, error } = useEmployee(id);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 bg-muted" />
        <Skeleton className="h-28 w-full bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full bg-muted" />
          <Skeleton className="h-48 w-full bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="space-y-4">
        <Link
          href="/employees"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('backToList')}
        </Link>
        <Alert variant="destructive" className="rounded-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{tCommon('error')}</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : t('noEmployeesFound')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb Navigation & PageHeader */}
      <PageHeader
        breadcrumbs={
          <Link
            href="/employees"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('backToList')}
          </Link>
        }
        title={employee.fullName}
        description={`${employee.jobTitle || 'No position'} • ${employee.department?.name || 'Unassigned department'}`}
        badge={<StatusBadge status={employee.status} />}
        actions={
          isHrAdmin && employee.status !== 'TERMINATED' ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="text-xs h-8.5 cursor-pointer font-mono"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5 text-primary" />
                {t('editEmployee')}
              </Button>

              {employee.status === 'ACTIVE' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeactivateOpen(true)}
                    className="text-xs h-8.5 text-[var(--status-warning)] border-[var(--status-warning)]/30 hover:bg-[var(--status-warning-bg)] cursor-pointer font-mono"
                  >
                    <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                    {t('deactivate')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTerminateOpen(true)}
                    className="text-xs h-8.5 text-[var(--status-danger)] border-[var(--status-danger)]/30 hover:bg-[var(--status-danger-bg)] cursor-pointer font-mono"
                  >
                    <UserX className="w-3.5 h-3.5 mr-1.5" />
                    {t('terminate')}
                  </Button>
                </>
              )}

              {employee.status === 'INACTIVE' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReactivateOpen(true)}
                    className="text-xs h-8.5 text-[var(--status-success)] border-[var(--status-success)]/30 hover:bg-[var(--status-success-bg)] cursor-pointer font-mono"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    {t('reactivate')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTerminateOpen(true)}
                    className="text-xs h-8.5 text-[var(--status-danger)] border-[var(--status-danger)]/30 hover:bg-[var(--status-danger-bg)] cursor-pointer font-mono"
                  >
                    <UserX className="w-3.5 h-3.5 mr-1.5" />
                    {t('terminate')}
                  </Button>
                </>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Overview Console Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 rounded-md border border-border bg-card divide-y md:divide-y-0 md:divide-x divide-border p-3 text-xs font-mono">
        <div className="p-2 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase">{t('nip')}</span>
          <p className="font-semibold text-foreground">{employee.nip}</p>
        </div>
        <div className="p-2 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase">{t('department')}</span>
          <p className="font-semibold text-foreground truncate">{employee.department?.name || '—'}</p>
        </div>
        <div className="p-2 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase">{t('hireDate')}</span>
          <p className="font-semibold text-foreground">{formatDate(employee.hireDate)}</p>
        </div>
        <div className="p-2 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase">Access Role</span>
          <p className="font-semibold text-foreground">{employee.user?.role || 'EMPLOYEE'}</p>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Personal & Contact Information */}
        <DetailSection title={t('personalInfo')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailGridItem label={t('fullName')} value={employee.fullName} />
            <DetailGridItem label={t('email')} value={employee.email} mono />
            <DetailGridItem label={t('phone')} value={employee.phone} mono />
            <DetailGridItem label={t('status')} value={<StatusBadge status={employee.status} showDot={false} />} />
          </div>
        </DetailSection>

        {/* Employment & Placement Details */}
        <DetailSection title={t('employmentInfo')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailGridItem label={t('nip')} value={employee.nip} mono />
            <DetailGridItem label={t('jobTitle')} value={employee.jobTitle} />
            <DetailGridItem label={t('department')} value={employee.department?.name} />
            <DetailGridItem label={t('hireDate')} value={formatDate(employee.hireDate)} />
          </div>
        </DetailSection>

        {/* System Access Account */}
        <DetailSection title={t('accountInfo')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailGridItem label="System User ID" value={employee.user?.id || '—'} mono />
            <DetailGridItem label={t('role')} value={employee.user?.role || 'EMPLOYEE'} mono />
            <DetailGridItem
              label="Account State"
              value={
                <StatusBadge
                  status={employee.status === 'INACTIVE' ? 'INACTIVE' : employee.status}
                  showDot={false}
                />
              }
            />
          </div>
        </DetailSection>

        {/* Compensation & Financial Snapshot */}
        <DetailSection title={tPayroll('basicSalary')}>
          {isHrAdmin || currentUser?.employee?.id === employee.id ? (
            <div className="space-y-3">
              <DetailGridItem
                label={t('basicSalary')}
                value={<MoneyValue amount={employee.baseSalary} className="text-base font-bold" />}
              />
              <p className="text-[11px] text-muted-foreground font-mono">
                {tPayroll('protectedDesc')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">{tPayroll('protectedDesc')}</p>
          )}
        </DetailSection>
      </div>

      {/* Lifecycle Audit Metadata */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
          Audit Records & Timestamps
        </h2>
        <AuditMeta
          createdAt={employee.createdAt}
          updatedAt={employee.updatedAt}
        />
      </div>

      {/* Modals & Dialogs */}
      <EmployeeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        employeeToEdit={employee}
      />

      <EmployeeDeleteDialog
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        employee={employee}
      />

      <EmployeeTerminateDialog
        open={isTerminateOpen}
        onOpenChange={setIsTerminateOpen}
        employee={employee}
      />

      <EmployeeReactivateDialog
        open={isReactivateOpen}
        onOpenChange={setIsReactivateOpen}
        employee={employee}
      />
    </div>
  );
}

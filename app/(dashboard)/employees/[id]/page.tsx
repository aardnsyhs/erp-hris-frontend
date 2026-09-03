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
import { EmergencyContactsTab } from '@/components/employees/emergency-contacts-tab';
import { EmployeeDocumentsTab } from '@/components/employees/employee-documents-tab';
import { ContractsTab } from '@/components/employees/contracts-tab';
import { PositionAssignmentsTab } from '@/components/employees/position-assignments-tab';
import { ReportingLinesTab } from '@/components/employees/reporting-lines-tab';
import { MovementHistoryTab } from '@/components/employees/movement-history-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const tEmergency = useTranslations('emergencyContacts');
  const tDocs = useTranslations('employeeDocuments');
  const locale = useLocale();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';
  const isSelf = currentUser?.employee?.id === id || currentUser?.employeeId === id;

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

  const canReactivate = employee.status === 'INACTIVE';
  const canDeactivate = employee.status === 'ACTIVE';
  const canTerminate = employee.status === 'ACTIVE' || employee.status === 'INACTIVE';
  const canEdit = isHrAdmin && employee.status !== 'TERMINATED';

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
          isHrAdmin && (canEdit || canReactivate || canDeactivate || canTerminate) ? (
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="text-xs h-8.5 cursor-pointer font-mono"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  {t('editEmployee')}
                </Button>
              )}

              {canReactivate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReactivateOpen(true)}
                  className="text-xs h-8.5 text-status-success border-(--status-success)/30 hover:bg-status-success-bg cursor-pointer font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  {t('reactivate')}
                </Button>
              )}

              {canDeactivate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeactivateOpen(true)}
                  className="text-xs h-8.5 text-status-warning border-(--status-warning)/30 hover:bg-status-warning-bg cursor-pointer font-mono"
                >
                  <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                  {t('deactivate')}
                </Button>
              )}

              {canTerminate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTerminateOpen(true)}
                  className="text-xs h-8.5 text-status-danger border-(--status-danger)/30 hover:bg-status-danger-bg cursor-pointer font-mono"
                >
                  <UserX className="w-3.5 h-3.5 mr-1.5" />
                  {t('terminate')}
                </Button>
              )}
            </div>
          ) : undefined
        }
      />
      <Tabs defaultValue="profile" className="w-full space-y-4">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60 gap-1 w-full justify-start">
          <TabsTrigger value="profile" className="text-xs font-medium cursor-pointer">
            {t('personalInfo')}
          </TabsTrigger>
          {(isHrAdmin || isSelf) && (
            <TabsTrigger value="contracts" className="text-xs font-medium cursor-pointer">
              Kontrak Kerja
            </TabsTrigger>
          )}
          <TabsTrigger value="positions" className="text-xs font-medium cursor-pointer">
            Riwayat Posisi
          </TabsTrigger>
          <TabsTrigger value="reporting" className="text-xs font-medium cursor-pointer">
            Garis Pelaporan
          </TabsTrigger>
          <TabsTrigger value="movements" className="text-xs font-medium cursor-pointer">
            Riwayat Perpindahan
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs font-medium cursor-pointer">
            {tDocs('title')}
          </TabsTrigger>
          <TabsTrigger value="emergency" className="text-xs font-medium cursor-pointer">
            {tEmergency('title')}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Employment Details */}
        <TabsContent value="profile" className="space-y-5 mt-0">
          {/* Overview Console Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 rounded-md border border-border bg-card divide-y md:divide-y-0 md:divide-x divide-border p-3 text-xs font-mono">
            <div className="p-2 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">{t('nip')}</span>
              <p className="font-semibold text-foreground">{employee.nip}</p>
            </div>
            <div className="p-2 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">{t('department')}</span>
              <p className="font-semibold text-foreground truncate">{employee.department?.name || '-'}</p>
            </div>
            <div className="p-2 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">{t('hireDate')}</span>
              <p className="font-semibold text-foreground">{formatDate(employee.hireDate)}</p>
            </div>
            <div className="p-2 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">{t('role')}</span>
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
                <DetailGridItem
                  label={t('department')}
                  value={
                    employee.department ? (
                      <span className="inline-flex items-center gap-1.5 flex-wrap">
                        <span>{employee.department.name}</span>
                        {employee.department.isActive === false && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono px-1.5 py-0 text-status-warning border-(--status-warning)/40 bg-status-warning-bg"
                          >
                            Diarsipkan
                          </Badge>
                        )}
                      </span>
                    ) : (
                      '-'
                    )
                  }
                />
                <DetailGridItem label={t('hireDate')} value={formatDate(employee.hireDate)} />
              </div>
            </DetailSection>

            {/* System Access Account */}
            <DetailSection title={t('accountInfo')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailGridItem label={t('userId')} value={employee.user?.id || '-'} mono />
                <DetailGridItem label={t('role')} value={employee.user?.role || 'EMPLOYEE'} mono />
                <DetailGridItem
                  label={t('accountStatus')}
                  value={
                    employee.user?.isActive ? (
                      <span className="text-status-success font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block" />
                        {t('active')}
                      </span>
                    ) : (
                      <span className="text-status-danger font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-danger inline-block" />
                        {t('inactive')}
                      </span>
                    )
                  }
                />
              </div>
            </DetailSection>

            {/* Compensation & Financial Snapshot */}
            <DetailSection title={tPayroll('basicSalary')}>
              {isHrAdmin || isSelf ? (
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
              {t('auditRecords')}
            </h2>
            <AuditMeta
              createdAt={employee.createdAt}
              updatedAt={employee.updatedAt}
            />
          </div>
        </TabsContent>

        {/* Tab 2: Contracts */}
        {(isHrAdmin || isSelf) && (
          <TabsContent value="contracts" className="mt-0">
            <ContractsTab
              employeeId={employee.id}
              isHrAdmin={isHrAdmin}
              isSelf={isSelf}
            />
          </TabsContent>
        )}

        {/* Tab 3: Position Assignments */}
        <TabsContent value="positions" className="mt-0">
          <PositionAssignmentsTab
            employeeId={employee.id}
            isHrAdmin={isHrAdmin}
            currentDepartmentId={employee.departmentId}
          />
        </TabsContent>

        {/* Tab 4: Reporting Lines */}
        <TabsContent value="reporting" className="mt-0">
          <ReportingLinesTab
            employeeId={employee.id}
            isHrAdmin={isHrAdmin}
          />
        </TabsContent>

        {/* Tab 5: Movement History */}
        <TabsContent value="movements" className="mt-0">
          <MovementHistoryTab employeeId={employee.id} />
        </TabsContent>

        {/* Tab 6: Employee Documents */}
        <TabsContent value="documents" className="mt-0">
          <EmployeeDocumentsTab
            employeeId={employee.id}
            isHrAdmin={isHrAdmin}
            isSelf={isSelf}
          />
        </TabsContent>

        {/* Tab 7: Emergency Contacts */}
        <TabsContent value="emergency" className="mt-0">
          <EmergencyContactsTab
            employeeId={employee.id}
            isHrAdmin={isHrAdmin}
            isSelf={isSelf}
          />
        </TabsContent>
      </Tabs>

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

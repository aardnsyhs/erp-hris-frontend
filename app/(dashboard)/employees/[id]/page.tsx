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
  ShieldAlert,
  User,
  Edit2,
  Clock,
  Briefcase,
  AlertCircle,
  RotateCcw,
  UserX,
  UserMinus,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEmployee } from '@/hooks/use-employees';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
  const tNav = useTranslations('navigation');
  const tPayroll = useTranslations('payroll');
  const locale = useLocale();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isReactivateOpen, setIsReactivateOpen] = useState(false);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);

  const { data: employee, isLoading, isError, error } = useEmployee(id);

  // Format currency helper
  const formatCurrency = (val: string | number | undefined) => {
    if (!val) return 'Rp 0';
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  // Format date helper
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  // Format date time helper
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Calculate tenure
  const calculateTenure = (hireDateStr?: string) => {
    if (!hireDateStr) return '-';
    const hire = new Date(hireDateStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - hire.getFullYear()) * 12 + (now.getMonth() - hire.getMonth());
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    if (locale === 'en') {
      if (years === 0) return `${months} months`;
      return `${years} years ${months > 0 ? `${months} months` : ''}`;
    }
    if (years === 0) return `${months} bulan`;
    return `${years} tahun ${months > 0 ? `${months} bulan` : ''}`;
  };

  // Handle 403 Forbidden Error State
  if (isError && (error as any)?.response?.status === 403) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="border-destructive/30 bg-destructive/10 text-center p-6 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-destructive">
              Akses Ditolak (403 Forbidden)
            </h2>
            <p className="text-sm text-muted-foreground">
              Anda tidak memiliki izin untuk melihat profil karyawan ini.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()} className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tCommon('back')}
            </Button>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: 'destructive' }))}
            >
              {tNav('dashboard')}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Handle 404 Not Found Error State
  if (isError && (error as any)?.response?.status === 404) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="text-center p-6 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">
              {t('noEmployeesFound')}
            </h2>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              href="/employees"
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToList')}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Loading State Skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!employee) return null;

  const isInactive = employee.status === 'INACTIVE';
  const isTerminated = employee.status === 'TERMINATED';
  const isActive = employee.status === 'ACTIVE';

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>{tNav('dashboard')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/employees" />}>{tNav('employees')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-40 sm:max-w-xs truncate font-medium">
              {employee.fullName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {tCommon('back')}
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {employee.fullName}
              </h1>
              {isInactive ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                  {t('statusInactive')}
                </Badge>
              ) : isTerminated ? (
                <Badge variant="destructive">
                  {t('statusTerminated')}
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {t('statusActive')}
                </Badge>
              )}
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              NIP: {employee.nip} • ID: {employee.id}
            </p>
          </div>
        </div>

        {isHrAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            {isInactive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReactivateOpen(true)}
                className="border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                {t('reactivate')}
              </Button>
            )}

            {isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeactivateOpen(true)}
                className="text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 text-xs cursor-pointer"
              >
                <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                {t('deactivateTitle')}
              </Button>
            )}

            {!isTerminated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTerminateOpen(true)}
                className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5 mr-1.5" />
                {t('terminate')}
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              {t('editEmployee')}
            </Button>
          </div>
        )}
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Informasi Kontak & Akun */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary">
              <User className="w-4 h-4" />
              <CardTitle className="text-base font-semibold">
                {t('personalInfo')}
              </CardTitle>
            </div>
            <CardDescription>
              {t('detailSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border">
              <span className="text-muted-foreground text-xs">{t('fullName')}</span>
              <span className="col-span-2 font-medium text-foreground">
                {employee.fullName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border">
              <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {t('email')}
              </span>
              <span className="col-span-2 font-medium text-foreground">
                {employee.email}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border">
              <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {t('phone')}
              </span>
              <span className="col-span-2 font-medium text-foreground">
                {employee.phone || '-'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> {t('role')}
              </span>
              <div className="col-span-2 flex items-center gap-2">
                {employee.user ? (
                  <Badge variant="secondary" className="text-xs uppercase">
                    {employee.user.role}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Informasi Kepegawaian */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary">
              <Briefcase className="w-4 h-4" />
              <CardTitle className="text-base font-semibold">
                {t('employmentInfo')}
              </CardTitle>
            </div>
            <CardDescription>
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border">
              <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> {t('department')}
              </span>
              <span className="col-span-2 font-medium text-foreground">
                {employee.department?.name || '-'}{' '}
                {employee.department?.code && (
                  <span className="text-xs text-muted-foreground">
                    ({employee.department.code})
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border">
              <span className="text-muted-foreground text-xs">{t('jobTitle')}</span>
              <span className="col-span-2 font-medium text-foreground">
                {employee.jobTitle}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border">
              <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {t('hireDate')}
              </span>
              <span className="col-span-2 font-medium text-foreground">
                {formatDate(employee.hireDate)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Masa Kerja
              </span>
              <span className="col-span-2 font-medium text-foreground">
                {calculateTenure(employee.hireDate)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Kompensasi & Gaji Pokok */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary">
              <CreditCard className="w-4 h-4" />
              <CardTitle className="text-base font-semibold">
                {t('basicSalary')}
              </CardTitle>
            </div>
            <CardDescription>
              {tPayroll('basicSalary')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {employee.baseSalary !== undefined ? (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-xs text-primary font-medium">
                  {t('basicSalary')}
                </span>
                <div className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(employee.baseSalary)}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted border border-border flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-foreground">
                    {tPayroll('protectedInfo')}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tPayroll('protectedDesc')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Metadata & Audit Trail */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              Audit & Metadata
            </CardTitle>
            <CardDescription>
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span>Created At:</span>
              <span className="font-mono text-foreground">
                {formatDateTime(employee.createdAt)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span>Updated At:</span>
              <span className="font-mono text-foreground">
                {formatDateTime(employee.updatedAt)}
              </span>
            </div>
            {employee.deletedAt && (
              <div className="flex justify-between py-1.5 text-destructive font-semibold">
                <span>Deleted At:</span>
                <span className="font-mono">{formatDateTime(employee.deletedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EmployeeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        employeeToEdit={employee}
      />

      {/* Deactivate Dialog */}
      {employee && (
        <EmployeeDeleteDialog
          open={isDeactivateOpen}
          onOpenChange={setIsDeactivateOpen}
          employee={employee}
        />
      )}

      {/* Reactivate Dialog */}
      {employee && (
        <EmployeeReactivateDialog
          open={isReactivateOpen}
          onOpenChange={setIsReactivateOpen}
          employee={employee}
        />
      )}

      {/* Terminate Dialog */}
      {employee && (
        <EmployeeTerminateDialog
          open={isTerminateOpen}
          onOpenChange={setIsTerminateOpen}
          employee={employee}
        />
      )}
    </div>
  );
}

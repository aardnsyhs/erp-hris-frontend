'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, ShieldCheck } from 'lucide-react';
import {
  employeeFormSchema,
  EmployeeFormValues,
} from '@/lib/validations/employee';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import { Employee, EmployeeStatus, UserRole } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LongDialogContent,
  LongDialogHeader,
  LongDialogBody,
  LongDialogFooter,
} from '@/components/shared/dialog-layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeCredentialsDialog } from './employee-credentials-dialog';

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeToEdit?: Employee | null;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employeeToEdit,
}: EmployeeFormDialogProps) {
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const isEditMode = !!employeeToEdit;

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const { data: departmentsData, isLoading: isLoadingDepts } = useDepartments();
  const departments = departmentsData?.data || [];

  const [createdCredentials, setCreatedCredentials] = useState<{
    fullName: string;
    email: string;
    role: string;
    temporaryPassword?: string;
  } | null>(null);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      role: 'EMPLOYEE',
      departmentId: '',
      nip: '',
      fullName: '',
      email: '',
      phone: '',
      jobTitle: '',
      hireDate: new Date().toISOString().split('T')[0],
      baseSalary: '',
      status: 'ACTIVE',
    },
  });

  const selectedDepartmentId = watch('departmentId');
  const selectedStatus = watch('status');
  const selectedRole = watch('role');
  const hireDate = watch('hireDate');

  useEffect(() => {
    if (open) {
      if (employeeToEdit) {
        reset({
          role: (employeeToEdit.user?.role as UserRole) || 'EMPLOYEE',
          departmentId: employeeToEdit.departmentId,
          nip: employeeToEdit.nip,
          fullName: employeeToEdit.fullName,
          email: employeeToEdit.email,
          phone: employeeToEdit.phone || '',
          jobTitle: employeeToEdit.jobTitle,
          hireDate: employeeToEdit.hireDate
            ? new Date(employeeToEdit.hireDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          baseSalary: String(employeeToEdit.baseSalary ?? ''),
          status: employeeToEdit.status,
        });
      } else {
        reset({
          role: 'EMPLOYEE',
          departmentId: '',
          nip: '',
          fullName: '',
          email: '',
          phone: '',
          jobTitle: '',
          hireDate: new Date().toISOString().split('T')[0],
          baseSalary: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [open, employeeToEdit, reset]);

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      if (isEditMode && employeeToEdit) {
        await updateMutation.mutateAsync({
          id: employeeToEdit.id,
          payload: {
            ...values,
            hireDate: new Date(values.hireDate),
          },
        });
        onOpenChange(false);
      } else {
        const response = await createMutation.mutateAsync({
          ...values,
          hireDate: new Date(values.hireDate),
        });
        onOpenChange(false);

        // If backend returned temporaryPassword, display credentials modal
        if (response.temporaryPassword) {
          setCreatedCredentials({
            fullName: response.fullName,
            email: response.email,
            role: values.role,
            temporaryPassword: response.temporaryPassword,
          });
        }
      }
    } catch {
      // Error toast is already handled in hook mutation callbacks
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
        <LongDialogContent className="sm:max-w-2xl">
          <LongDialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {isEditMode ? t('editEmployee') : t('addEmployee')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {t('subtitle')}
            </DialogDescription>
          </LongDialogHeader>

          <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <LongDialogBody>
              <div className="space-y-4">
                {/* Row 0: Role Selection (Only in Create Mode) */}
                {!isEditMode && (
                  <div className="space-y-1.5 p-3 rounded-md bg-muted/40 border border-border">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      {t('role')} <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={selectedRole}
                      onValueChange={(val) => {
                        if (val) setValue('role', val as UserRole, { shouldValidate: true });
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full h-9 bg-card text-foreground">
                        <SelectValue placeholder={t('role')}>
                          {selectedRole === 'HR_ADMIN'
                            ? t('roleHrAdmin')
                            : selectedRole === 'MANAGER'
                            ? t('roleManager')
                            : t('roleEmployee')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">{t('roleEmployee')}</SelectItem>
                        <SelectItem value="MANAGER">{t('roleManager')}</SelectItem>
                        <SelectItem value="HR_ADMIN">{t('roleHrAdmin')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-xs text-destructive">{errors.role.message}</p>
                    )}
                  </div>
                )}

                {/* Row 1: NIP & Full Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground font-mono">
                      {t('nip')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="EMP-001"
                      {...register('nip')}
                      disabled={isSubmitting}
                      className="font-mono text-xs"
                    />
                    {errors.nip && (
                      <p className="text-xs text-status-danger font-mono">{errors.nip.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground font-mono">
                      {t('fullName')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Budi Santoso"
                      {...register('fullName')}
                      disabled={isSubmitting}
                      className="text-xs"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-status-danger font-mono">{errors.fullName.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Email & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground font-mono">
                      {t('email')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="budi@company.com"
                      {...register('email')}
                      disabled={isSubmitting || isEditMode}
                      className="font-mono text-xs"
                    />
                    {errors.email ? (
                      <p className="text-xs text-status-danger font-mono">{errors.email.message}</p>
                    ) : isEditMode ? (
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {t('emailCannotBeChanged')}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground font-mono">
                      {t('phone')}
                    </label>
                    <Input
                      placeholder="08123456789"
                      {...register('phone')}
                      disabled={isSubmitting}
                      className="font-mono text-xs"
                    />
                    {errors.phone && (
                      <p className="text-xs text-status-danger font-mono">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Department & Job Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground font-mono">
                      {t('department')}
                    </label>
                    <Select
                      value={selectedDepartmentId || 'NONE'}
                      onValueChange={(val) => {
                        setValue('departmentId', !val || val === 'NONE' ? '' : val, { shouldValidate: true });
                      }}
                      disabled={isSubmitting || isLoadingDepts}
                    >
                      <SelectTrigger className="w-full h-9 font-mono text-xs">
                        <SelectValue placeholder={t('selectDepartment')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">{t('noDepartment')}</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.departmentId && (
                      <p className="text-xs text-status-danger font-mono">{errors.departmentId.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground font-mono">
                      {t('jobTitle')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Software Engineer"
                      {...register('jobTitle')}
                      disabled={isSubmitting}
                      className="text-xs"
                    />
                    {errors.jobTitle && (
                      <p className="text-xs text-status-danger font-mono">{errors.jobTitle.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 4: Hire Date & Base Salary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground font-mono">
                      {t('hireDate')} <span className="text-destructive">*</span>
                    </label>
                    <DatePicker
                      value={hireDate}
                      onChange={(val) => {
                        setValue('hireDate', val, { shouldValidate: true });
                      }}
                      disabled={isSubmitting}
                      placeholder={t('hireDate')}
                    />
                    {errors.hireDate && (
                      <p className="text-xs text-status-danger font-mono">{errors.hireDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground font-mono">
                      {t('basicSalary')} (Rp) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="15000000"
                      {...register('baseSalary')}
                      disabled={isSubmitting}
                      className="font-mono text-xs"
                    />
                    {errors.baseSalary && (
                      <p className="text-xs text-status-danger font-mono">{errors.baseSalary.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 5: Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground font-mono">
                    {t('accountStatus')} <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(val) => {
                      if (val) setValue('status', val as EmployeeStatus, { shouldValidate: true });
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full h-9 font-mono text-xs">
                      <SelectValue placeholder={t('accountStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">{t('statusActive')}</SelectItem>
                      <SelectItem value="INACTIVE">{t('statusInactive')}</SelectItem>
                      <SelectItem value="TERMINATED">{t('statusTerminated')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-xs text-status-danger font-mono">{errors.status.message}</p>
                  )}
                </div>
              </div>
            </LongDialogBody>

            <LongDialogFooter>
              <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="min-h-11 w-full sm:w-auto font-mono text-xs cursor-pointer"
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  type="submit"
                  form="employee-form"
                  className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      {tCommon('saving')}
                    </>
                  ) : isEditMode ? (
                    tCommon('save')
                  ) : (
                    tCommon('create')
                  )}
                </Button>
              </div>
            </LongDialogFooter>
          </form>
        </LongDialogContent>
      </Dialog>

      {/* Temporary Credentials Display Dialog */}
      <EmployeeCredentialsDialog
        credentials={createdCredentials}
        open={!!createdCredentials}
        onOpenChange={(isOpen) => !isOpen && setCreatedCredentials(null)}
      />
    </>
  );
}

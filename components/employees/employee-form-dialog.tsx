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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0 pr-10 sm:pr-12">
            <DialogTitle>
              {isEditMode ? t('editEmployee') : t('addEmployee')}
            </DialogTitle>
            <DialogDescription>
              {t('subtitle')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="space-y-4 py-2">
                {/* Row 0: Role Selection (Only in Create Mode) */}
                {!isEditMode && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border">
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
                            ? 'HR Administrator (HR_ADMIN)'
                            : selectedRole === 'MANAGER'
                            ? 'Manager (MANAGER)'
                            : 'Employee (EMPLOYEE)'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Employee (EMPLOYEE)</SelectItem>
                        <SelectItem value="MANAGER">Manager (MANAGER)</SelectItem>
                        <SelectItem value="HR_ADMIN">HR Administrator (HR_ADMIN)</SelectItem>
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
                    <label className="text-xs font-semibold text-foreground">
                      {t('nip')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="EMP001"
                      {...register('nip')}
                      disabled={isSubmitting}
                    />
                    {errors.nip && (
                      <p className="text-xs text-destructive">{errors.nip.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t('fullName')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Budi Santoso"
                      {...register('fullName')}
                      disabled={isSubmitting}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">{errors.fullName.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t('email')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="budi@example.com"
                      {...register('email')}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t('phone')} ({tCommon('optional')})
                    </label>
                    <Input
                      placeholder="081234567890"
                      {...register('phone')}
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Department & Job Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t('department')} <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={selectedDepartmentId}
                      onValueChange={(val) => {
                        if (val) setValue('departmentId', val, { shouldValidate: true });
                      }}
                      disabled={isSubmitting || isLoadingDepts}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingDepts ? tCommon('loading') : t('department')}>
                          {departments.find((d) => d.id === selectedDepartmentId)
                            ? `${departments.find((d) => d.id === selectedDepartmentId)?.name} (${departments.find((d) => d.id === selectedDepartmentId)?.code})`
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.departmentId && (
                      <p className="text-xs text-destructive">{errors.departmentId.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t('jobTitle')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Software Engineer"
                      {...register('jobTitle')}
                      disabled={isSubmitting}
                    />
                    {errors.jobTitle && (
                      <p className="text-xs text-destructive">{errors.jobTitle.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 4: Hire Date & Base Salary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
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
                      <p className="text-xs text-destructive">{errors.hireDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t('basicSalary')} (Rp) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="15000000"
                      {...register('baseSalary')}
                      disabled={isSubmitting}
                    />
                    {errors.baseSalary && (
                      <p className="text-xs text-destructive">{errors.baseSalary.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 5: Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t('status')} <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(val) => {
                      if (val) setValue('status', val as EmployeeStatus, { shouldValidate: true });
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('status')}>
                        {selectedStatus === 'ACTIVE'
                          ? t('statusActive')
                          : selectedStatus === 'INACTIVE'
                          ? t('statusInactive')
                          : selectedStatus === 'TERMINATED'
                          ? t('statusTerminated')
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">{t('statusActive')}</SelectItem>
                      <SelectItem value="INACTIVE">{t('statusInactive')}</SelectItem>
                      <SelectItem value="TERMINATED">{t('statusTerminated')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-xs text-destructive">{errors.status.message}</p>
                  )}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {tCommon('saving')}
                  </>
                ) : isEditMode ? (
                  tCommon('save')
                ) : (
                  tCommon('create')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
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

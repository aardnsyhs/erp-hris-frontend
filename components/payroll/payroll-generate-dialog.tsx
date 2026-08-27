'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, Calculator, Loader2, Sparkles } from 'lucide-react';
import {
  createPayrollSchema,
  CreatePayrollFormValues,
} from '@/lib/validations/payroll';
import { useCreatePayroll } from '@/hooks/use-payrolls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateRangePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmployeeCombobox } from '@/components/employees/employee-combobox';

interface PayrollGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollGenerateDialog({
  open,
  onOpenChange,
}: PayrollGenerateDialogProps) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');
  const tEmp = useTranslations('employees');

  const createMutation = useCreatePayroll();
  const isSubmitting = createMutation.isPending;
  const [conflictError, setConflictError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreatePayrollFormValues>({
    resolver: zodResolver(createPayrollSchema),
    defaultValues: {
      employeeId: '',
      periodStart: '',
      periodEnd: '',
      allowances: '0',
      deductions: '0',
    },
  });

  const selectedEmployeeId = watch('employeeId');
  const periodStart = watch('periodStart');
  const periodEnd = watch('periodEnd');

  useEffect(() => {
    if (open) {
      setConflictError(null);
      reset({
        employeeId: '',
        periodStart: '',
        periodEnd: '',
        allowances: '0',
        deductions: '0',
      });
    }
  }, [open, reset]);

  const onSubmit = async (values: CreatePayrollFormValues) => {
    setConflictError(null);
    try {
      await createMutation.mutateAsync({
        employeeId: values.employeeId,
        periodStart: values.periodStart,
        periodEnd: values.periodEnd,
        allowances: values.allowances || '0',
        deductions: values.deductions || '0',
      });
      onOpenChange(false);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        const msg =
          'Payroll untuk karyawan ini pada periode tersebut sudah ada.';
        setConflictError(msg);
        setError('periodEnd', { message: msg });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="gap-2 shrink-0 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calculator className="w-5 h-5" />
            </div>
            <DialogTitle>{t('generateDraft')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        {/* 409 Conflict Alert Box */}
        {conflictError && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2.5 text-xs text-destructive shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{conflictError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4 py-2">
              {/* Employee Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {tEmp('fullName')} <span className="text-destructive">*</span>
                </label>
                <EmployeeCombobox
                  value={selectedEmployeeId}
                  onChange={(empId) => {
                    setValue('employeeId', empId, { shouldValidate: true });
                    setConflictError(null);
                  }}
                  disabled={isSubmitting}
                />
                {errors.employeeId && (
                  <p className="text-xs text-destructive">{errors.employeeId.message}</p>
                )}
              </div>

              {/* Period Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {t('period')} <span className="text-destructive">*</span>
                </label>
                <DateRangePicker
                  from={periodStart}
                  to={periodEnd}
                  onChange={({ from, to }) => {
                    setValue('periodStart', from, { shouldValidate: true });
                    setValue('periodEnd', to, { shouldValidate: true });
                    setConflictError(null);
                  }}
                  disabled={isSubmitting}
                  placeholder={t('period')}
                />
                {(errors.periodStart || errors.periodEnd) && (
                  <p className="text-xs text-destructive">
                    {errors.periodStart?.message || errors.periodEnd?.message}
                  </p>
                )}
              </div>

              {/* Financial Adjustments: Allowances & Deductions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t('allowances')} (Rp)
                  </label>
                  <Input
                    type="text"
                    placeholder="0"
                    {...register('allowances')}
                    disabled={isSubmitting}
                  />
                  {errors.allowances && (
                    <p className="text-xs text-destructive">{errors.allowances.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t('deductions')} (Rp)
                  </label>
                  <Input
                    type="text"
                    placeholder="0"
                    {...register('deductions')}
                    disabled={isSubmitting}
                  />
                  {errors.deductions && (
                    <p className="text-xs text-destructive">{errors.deductions.message}</p>
                  )}
                </div>
              </div>

              {/* Snapshot Info Box */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-start gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>{t('basicSalary')}</strong> di-snapshot otomatis, dan <strong>{t('netSalary')}</strong> dihitung otomatis.
                </span>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-3 shrink-0">
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tCommon('processing')}
                </>
              ) : (
                t('generateDraft')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

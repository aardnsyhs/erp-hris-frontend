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
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LongDialogContent,
  LongDialogHeader,
  LongDialogBody,
  LongDialogFooter,
} from '@/components/shared/dialog-layout';
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
  const [conflictError, setConflictError] = useState<string | null>(null);

  const isSubmitting = createMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreatePayrollFormValues>({
    resolver: zodResolver(createPayrollSchema),
    defaultValues: {
      employeeId: '',
      periodStart: '',
      periodEnd: '',
      allowances: '',
      deductions: '',
    },
  });

  const selectedEmployeeId = watch('employeeId');
  const periodStart = watch('periodStart');
  const periodEnd = watch('periodEnd');

  useEffect(() => {
    if (open) {
      reset({
        employeeId: '',
        periodStart: '',
        periodEnd: '',
        allowances: '',
        deductions: '',
      });
      setConflictError(null);
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
        const msg = t('conflictError');
        setConflictError(msg);
        setError('periodEnd', { message: msg });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <LongDialogContent className="sm:max-w-2xl">
        <LongDialogHeader>
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-md bg-primary/10 text-primary border border-primary/20">
              <Calculator className="w-4 h-4" />
            </div>
            <DialogTitle className="text-sm font-semibold">{t('generateDraft')}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {t('subtitle')}
          </DialogDescription>
        </LongDialogHeader>

        {/* 409 Conflict Alert Box */}
        {conflictError && (
          <div className="p-3 mx-4 sm:mx-5 mt-4 rounded-md bg-status-danger-bg border border-(--status-danger)/30 flex items-start gap-2 text-xs text-status-danger shrink-0 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{conflictError}</p>
            </div>
          </div>
        )}

        <form
          id="payroll-generate-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <LongDialogBody className="font-mono text-xs">
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
                <p className="text-xs text-status-danger font-mono">{errors.employeeId.message}</p>
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
                <p className="text-xs text-status-danger font-mono">
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
                  className="font-mono text-xs"
                />
                {errors.allowances && (
                  <p className="text-xs text-status-danger font-mono">{errors.allowances.message}</p>
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
                  className="font-mono text-xs"
                />
                {errors.deductions && (
                  <p className="text-xs text-status-danger font-mono">{errors.deductions.message}</p>
                )}
              </div>
            </div>

            {/* Snapshot Info Box */}
            <div className="p-3 rounded-md bg-muted/40 border border-border flex items-start gap-2 text-xs text-muted-foreground font-mono">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                {t('snapshotHelp')}
              </span>
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
                form="payroll-generate-form"
                className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    {tCommon('processing')}
                  </>
                ) : (
                  t('generateDraft')
                )}
              </Button>
            </div>
          </LongDialogFooter>
        </form>
      </LongDialogContent>
    </Dialog>
  );
}

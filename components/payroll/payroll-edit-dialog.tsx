'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { Edit2, Loader2 } from 'lucide-react';
import {
  updatePayrollSchema,
  UpdatePayrollFormValues,
} from '@/lib/validations/payroll';
import { useUpdatePayroll } from '@/hooks/use-payrolls';
import { Payroll } from '@/types/payroll';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PayrollEditDialogProps {
  payroll: Payroll | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollEditDialog({
  payroll,
  open,
  onOpenChange,
}: PayrollEditDialogProps) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const updateMutation = useUpdatePayroll();
  const isSubmitting = updateMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdatePayrollFormValues>({
    resolver: zodResolver(updatePayrollSchema),
    defaultValues: {
      allowances: '0',
      deductions: '0',
    },
  });

  const watchedAllowances = watch('allowances') || '0';
  const watchedDeductions = watch('deductions') || '0';

  useEffect(() => {
    if (open && payroll) {
      reset({
        allowances: String(payroll.allowances ?? 0),
        deductions: String(payroll.deductions ?? 0),
      });
    }
  }, [open, payroll, reset]);

  // Estimate net salary live
  const basic = Number(payroll?.basicSalary ?? 0);
  const allow = Number(watchedAllowances) || 0;
  const deduct = Number(watchedDeductions) || 0;
  const estimatedNet = basic + allow - deduct;

  const formatCurrency = (val: number) => {
    const formatted = Math.abs(val).toLocaleString(locale === 'en' ? 'en-US' : 'id-ID');
    if (val < 0) {
      return `(Rp ${formatted})`;
    }
    return `Rp ${formatted}`;
  };

  const onSubmit = async (values: UpdatePayrollFormValues) => {
    if (!payroll) return;
    try {
      await updateMutation.mutateAsync({
        id: payroll.id,
        payload: {
          allowances: values.allowances || '0',
          deductions: values.deductions || '0',
        },
      });
      onOpenChange(false);
    } catch {
      // Toast handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-md">
        <DialogHeader className="shrink-0 pr-10">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-md bg-primary/10 text-primary border border-primary/20">
              <Edit2 className="w-4 h-4" />
            </div>
            <DialogTitle className="text-sm font-semibold">{t('editDraft')}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {payroll?.employee?.fullName}
          </DialogDescription>
        </DialogHeader>

        <form
          id="payroll-edit-form"
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2 font-mono text-xs"
        >
          {/* Snapshotted Basic Salary (Read-only) */}
          <div className="p-3.5 rounded-md bg-card border border-border space-y-1 shadow-2xs">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t('basicSalary')}
            </span>
            <p className="font-mono font-bold text-xs text-foreground">
              {formatCurrency(basic)}
            </p>
          </div>

          {/* Allowances */}
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

          {/* Deductions */}
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

          {/* Estimated Net Salary Box */}
          <div
            className={`p-3.5 rounded-md border flex items-center justify-between text-xs font-mono shadow-2xs ${
              estimatedNet < 0
                ? 'bg-status-danger-bg border-(--status-danger)/30 text-status-danger'
                : 'bg-status-success-bg border-(--status-success)/30 text-status-success'
            }`}
          >
            <span className="font-semibold">{t('netSalary')}:</span>
            <span className="font-mono font-bold text-xs">
              {formatCurrency(estimatedNet)}
            </span>
          </div>
        </form>

        <DialogFooter className="shrink-0 pt-2">
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
            form="payroll-edit-form"
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('saving')}
              </>
            ) : (
              tCommon('save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

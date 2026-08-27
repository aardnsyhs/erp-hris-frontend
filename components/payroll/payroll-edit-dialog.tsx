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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <DialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-2 rounded-xl bg-primary/10">
              <Edit2 className="w-5 h-5" />
            </div>
            <DialogTitle>{t('editDraft')}</DialogTitle>
          </div>
          <DialogDescription>
            {payroll?.employee?.fullName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Snapshotted Basic Salary (Read-only) */}
          <div className="p-3 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              {t('basicSalary')}
            </span>
            <p className="font-mono font-bold text-sm text-foreground">
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
            />
            {errors.allowances && (
              <p className="text-xs text-destructive">{errors.allowances.message}</p>
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
            />
            {errors.deductions && (
              <p className="text-xs text-destructive">{errors.deductions.message}</p>
            )}
          </div>

          {/* Estimated Net Salary Box */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs shadow-2xs ${
              estimatedNet < 0
                ? 'bg-destructive/10 border-destructive/30 text-destructive'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <span className="font-semibold">{t('netSalary')}:</span>
            <span className="font-mono font-bold text-sm">
              {formatCurrency(estimatedNet)}
            </span>
          </div>

          <DialogFooter className="pt-3">
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
              ) : (
                tCommon('save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
    if (val < 0) {
      return `(Rp ${Math.abs(val).toLocaleString('id-ID')})`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950">
              <Edit2 className="w-5 h-5" />
            </div>
            <DialogTitle>Edit Draft Payroll</DialogTitle>
          </div>
          <DialogDescription>
            Ubah tunjangan atau potongan gaji untuk{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">
              {payroll?.employee?.fullName}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Snapshotted Basic Salary (Read-only) */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <span className="text-[11px] font-semibold text-neutral-400 block">
              Gaji Pokok Snapshot (Terkunci)
            </span>
            <p className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100">
              {formatCurrency(basic)}
            </p>
          </div>

          {/* Allowances */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Tunjangan Tambahan (Rp)
            </label>
            <Input
              type="text"
              placeholder="0"
              {...register('allowances')}
              disabled={isSubmitting}
            />
            {errors.allowances && (
              <p className="text-xs text-red-500">{errors.allowances.message}</p>
            )}
          </div>

          {/* Deductions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Potongan Gaji (Rp)
            </label>
            <Input
              type="text"
              placeholder="0"
              {...register('deductions')}
              disabled={isSubmitting}
            />
            {errors.deductions && (
              <p className="text-xs text-red-500">{errors.deductions.message}</p>
            )}
          </div>

          {/* Estimated Net Salary Box */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              estimatedNet < 0
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <span className="font-semibold">Estimasi Gaji Bersih (Net):</span>
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
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

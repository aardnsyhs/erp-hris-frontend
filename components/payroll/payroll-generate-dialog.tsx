'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950">
              <Calculator className="w-5 h-5" />
            </div>
            <DialogTitle>Generate Draft Payroll</DialogTitle>
          </div>
          <DialogDescription>
            Buat draft payroll baru untuk karyawan. Gaji pokok akan di-snapshot otomatis dari data karyawan aktif.
          </DialogDescription>
        </DialogHeader>

        {/* 409 Conflict Alert Box */}
        {conflictError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Duplikasi Periode Payroll Terdeteksi</p>
              <p className="mt-0.5">{conflictError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4 py-2">
              {/* Employee Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Pilih Karyawan Penerima Gaji <span className="text-red-500">*</span>
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
                  <p className="text-xs text-red-500">{errors.employeeId.message}</p>
                )}
              </div>

              {/* Period Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Periode Penggajian <span className="text-red-500">*</span>
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
                  placeholder="Pilih awal s/d akhir periode gaji"
                />
                {(errors.periodStart || errors.periodEnd) && (
                  <p className="text-xs text-red-500">
                    {errors.periodStart?.message || errors.periodEnd?.message}
                  </p>
                )}
              </div>

              {/* Financial Adjustments: Allowances & Deductions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Snapshot Info Box */}
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-start gap-2 text-xs text-neutral-500">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Gaji Pokok (basicSalary)</strong> akan di-snapshot otomatis oleh sistem dari data profil karyawan saat draft dibuat, dan <strong>Gaji Bersih (netSalary)</strong> dihitung otomatis.
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
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Generate Draft Payroll'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

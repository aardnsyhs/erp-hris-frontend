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
import { useEmployees } from '@/hooks/use-employees';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  // Load active employees list for selection
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    limit: 100,
    page: 1,
  });

  // Filter active employees (deletedAt: null and status === 'ACTIVE')
  const activeEmployees = (employeesData?.data || []).filter(
    (emp) => !emp.deletedAt && emp.status === 'ACTIVE',
  );

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-2">
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
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Duplikasi Periode Payroll Terdeteksi</p>
              <p className="mt-0.5">{conflictError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Employee Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Pilih Karyawan Penerima Gaji <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedEmployeeId}
              onValueChange={(val) => {
                if (val) {
                  setValue('employeeId', val, { shouldValidate: true });
                  setConflictError(null);
                }
              }}
              disabled={isSubmitting || isLoadingEmployees}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder={isLoadingEmployees ? 'Memuat karyawan...' : 'Pilih Karyawan Aktif'}>
                  {activeEmployees.find((e) => e.id === selectedEmployeeId)
                    ? `${activeEmployees.find((e) => e.id === selectedEmployeeId)?.fullName} (${activeEmployees.find((e) => e.id === selectedEmployeeId)?.nip})`
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activeEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.nip}) - {emp.department?.name || emp.jobTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && (
              <p className="text-xs text-red-500">{errors.employeeId.message}</p>
            )}
          </div>

          {/* Period Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Awal Periode <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                {...register('periodStart')}
                disabled={isSubmitting}
                onChange={(e) => {
                  setConflictError(null);
                  register('periodStart').onChange(e);
                }}
              />
              {errors.periodStart && (
                <p className="text-xs text-red-500">{errors.periodStart.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Akhir Periode <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                {...register('periodEnd')}
                disabled={isSubmitting}
                onChange={(e) => {
                  setConflictError(null);
                  register('periodEnd').onChange(e);
                }}
              />
              {errors.periodEnd && (
                <p className="text-xs text-red-500">{errors.periodEnd.message}</p>
              )}
            </div>
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

'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarPlus, Loader2, Calendar, FileText } from 'lucide-react';
import {
  leaveRequestFormSchema,
  LeaveRequestFormValues,
} from '@/lib/validations/leave-request';
import { useCreateLeaveRequest } from '@/hooks/use-leave-requests';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LeaveType } from '@/types/leave-request';

interface LeaveRequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveRequestFormDialog({
  open,
  onOpenChange,
}: LeaveRequestFormDialogProps) {
  const createMutation = useCreateLeaveRequest();
  const isSubmitting = createMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      leaveType: 'ANNUAL',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const selectedLeaveType = watch('leaveType');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    if (open) {
      reset({
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: '',
      });
    }
  }, [open, reset]);

  // Calculate day count
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const dayCount = calculateDays();

  const onSubmit = async (values: LeaveRequestFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      onOpenChange(false);
    } catch {
      // Toast notification is handled in useCreateLeaveRequest hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="gap-2 shrink-0 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <DialogTitle>Ajukan Permohonan Cuti</DialogTitle>
          </div>
          <DialogDescription>
            Isi formulir pengajuan cuti Anda. Pengajuan akan diteruskan ke Manager departemen / HR Admin untuk diverifikasi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4 py-2">
              {/* Tipe Cuti */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Tipe Cuti <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedLeaveType}
                  onValueChange={(val) => {
                    if (val) setValue('leaveType', val as LeaveType, { shouldValidate: true });
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Pilih Tipe Cuti">
                      {selectedLeaveType === 'ANNUAL'
                        ? 'Cuti Tahunan (ANNUAL)'
                        : selectedLeaveType === 'SICK'
                        ? 'Cuti Sakit (SICK)'
                        : selectedLeaveType === 'UNPAID'
                        ? 'Cuti Tanpa Gaji (UNPAID)'
                        : selectedLeaveType === 'MATERNITY'
                        ? 'Cuti Melahirkan (MATERNITY)'
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANNUAL">Cuti Tahunan (ANNUAL)</SelectItem>
                    <SelectItem value="SICK">Cuti Sakit (SICK)</SelectItem>
                    <SelectItem value="UNPAID">Cuti Tanpa Gaji (UNPAID)</SelectItem>
                    <SelectItem value="MATERNITY">Cuti Melahirkan (MATERNITY)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.leaveType && (
                  <p className="text-xs text-red-500">{errors.leaveType.message}</p>
                )}
              </div>

              {/* Date Range Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Rentang Tanggal Cuti <span className="text-red-500">*</span>
                </label>
                <DateRangePicker
                  from={startDate}
                  to={endDate}
                  onChange={({ from, to }) => {
                    setValue('startDate', from, { shouldValidate: true });
                    setValue('endDate', to, { shouldValidate: true });
                  }}
                  disabled={isSubmitting}
                  placeholder="Pilih tanggal mulai s/d selesai"
                />
                {(errors.startDate || errors.endDate) && (
                  <p className="text-xs text-red-500">
                    {errors.startDate?.message || errors.endDate?.message}
                  </p>
                )}
              </div>

              {/* Duration Summary Badge */}
              {dayCount > 0 && (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Estimasi Durasi Pengajuan:</span>
                  </div>
                  <Badge className="bg-blue-600 text-white font-semibold">
                    {dayCount} Hari
                  </Badge>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Alasan Pengajuan Cuti <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-2xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 min-h-22.5 outline-none"
                  placeholder="Contoh: Mengambil cuti tahunan untuk keperluan keluarga ke luar kota..."
                  {...register('reason')}
                  disabled={isSubmitting}
                />
                {errors.reason && (
                  <p className="text-xs text-red-500">{errors.reason.message}</p>
                )}
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirimkan...
                </>
              ) : (
                'Kirim Pengajuan Cuti'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

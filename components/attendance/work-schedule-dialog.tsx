'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Loader2, Settings } from 'lucide-react';
import {
  workScheduleSchema,
  WorkScheduleFormValues,
} from '@/lib/validations/attendance';
import {
  useUpdateWorkSchedule,
  useWorkSchedule,
} from '@/hooks/use-work-schedule';
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

interface WorkScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkScheduleDialog({
  open,
  onOpenChange,
}: WorkScheduleDialogProps) {
  const { data: schedule, isLoading: isLoadingSchedule } = useWorkSchedule();
  const updateMutation = useUpdateWorkSchedule();
  const isSubmitting = updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkScheduleFormValues>({
    resolver: zodResolver(workScheduleSchema),
    defaultValues: {
      startTime: '09:00',
      lateToleranceMinutes: 15,
      standardWorkMinutes: 480,
    },
  });

  useEffect(() => {
    if (open && schedule) {
      reset({
        startTime: schedule.startTime,
        lateToleranceMinutes: schedule.lateToleranceMinutes,
        standardWorkMinutes: schedule.standardWorkMinutes,
      });
    }
  }, [open, schedule, reset]);

  const onSubmit = async (values: WorkScheduleFormValues) => {
    try {
      await updateMutation.mutateAsync(values);
      onOpenChange(false);
    } catch {
      // Toast notification is handled in useUpdateWorkSchedule
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950">
              <Settings className="w-5 h-5" />
            </div>
            <DialogTitle>Pengaturan Jadwal Kerja Organisasi</DialogTitle>
          </div>
          <DialogDescription>
            Atur jam mulai kerja standar (WIB), batas menit toleransi keterlambatan, dan target jam kerja harian.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Field: Start Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Jam Masuk Kerja (WIB / Asia/Jakarta) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="09:00"
                {...register('startTime')}
                disabled={isSubmitting || isLoadingSchedule}
              />
            </div>
            {errors.startTime ? (
              <p className="text-xs text-red-500">{errors.startTime.message}</p>
            ) : (
              <p className="text-[11px] text-neutral-400">
                Gunakan format 24 jam "HH:mm" (contoh: 08:30 atau 09:00).
              </p>
            )}
          </div>

          {/* Field: Late Tolerance Minutes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Toleransi Keterlambatan (Menit) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="15"
              {...register('lateToleranceMinutes', { valueAsNumber: true })}
              disabled={isSubmitting || isLoadingSchedule}
            />
            {errors.lateToleranceMinutes ? (
              <p className="text-xs text-red-500">
                {errors.lateToleranceMinutes.message}
              </p>
            ) : (
              <p className="text-[11px] text-neutral-400">
                Check-in setelah jam masuk + toleransi akan ditandai berstatus "LATE" (Terlambat).
              </p>
            )}
          </div>

          {/* Field: Standard Work Minutes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Target Jam Kerja Standar (Menit) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="480"
              {...register('standardWorkMinutes', { valueAsNumber: true })}
              disabled={isSubmitting || isLoadingSchedule}
            />
            {errors.standardWorkMinutes ? (
              <p className="text-xs text-red-500">
                {errors.standardWorkMinutes.message}
              </p>
            ) : (
              <p className="text-[11px] text-neutral-400">
                480 menit setara dengan 8 jam kerja reguler.
              </p>
            )}
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isSubmitting || isLoadingSchedule}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Pengaturan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

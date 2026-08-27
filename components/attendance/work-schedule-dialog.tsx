'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, Settings } from 'lucide-react';
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
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
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
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <DialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-2 rounded-xl bg-primary/10">
              <Settings className="w-5 h-5" />
            </div>
            <DialogTitle>{t('workSchedule')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Field: Start Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('standardStartTime')} <span className="text-destructive">*</span>
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
              <p className="text-xs text-destructive">{errors.startTime.message}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Format 24 jam "HH:mm" (08:30, 09:00).
              </p>
            )}
          </div>

          {/* Field: Late Tolerance Minutes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('gracePeriodMinutes')} <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              placeholder="15"
              {...register('lateToleranceMinutes', { valueAsNumber: true })}
              disabled={isSubmitting || isLoadingSchedule}
            />
            {errors.lateToleranceMinutes ? (
              <p className="text-xs text-destructive">
                {errors.lateToleranceMinutes.message}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {t('statusLate')} jika lewat dari batas ini.
              </p>
            )}
          </div>

          {/* Field: Standard Work Minutes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('dailyTargetHours')} (Menit) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              placeholder="480"
              {...register('standardWorkMinutes', { valueAsNumber: true })}
              disabled={isSubmitting || isLoadingSchedule}
            />
            {errors.standardWorkMinutes && (
              <p className="text-xs text-destructive">
                {errors.standardWorkMinutes.message}
              </p>
            )}
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
              disabled={isSubmitting || isLoadingSchedule}
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

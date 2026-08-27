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
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-md">
        <DialogHeader className="shrink-0 pr-10">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-md bg-primary/10 text-primary border border-primary/20">
              <Settings className="w-4 h-4" />
            </div>
            <DialogTitle className="text-sm font-semibold">{t('workSchedule')}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        <form
          id="work-schedule-form"
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2 font-mono text-xs"
        >
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
                className="font-mono text-xs"
              />
            </div>
            {errors.startTime ? (
              <p className="text-xs text-status-danger font-mono">{errors.startTime.message}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground font-mono">
                {t('formatTimeHelper')}
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
              className="font-mono text-xs"
            />
            {errors.lateToleranceMinutes ? (
              <p className="text-xs text-status-danger font-mono">
                {errors.lateToleranceMinutes.message}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground font-mono">
                {t('gracePeriodHelper')}
              </p>
            )}
          </div>

          {/* Field: Standard Work Minutes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('dailyTargetMinutes')} <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              placeholder="480"
              {...register('standardWorkMinutes', { valueAsNumber: true })}
              disabled={isSubmitting || isLoadingSchedule}
              className="font-mono text-xs"
            />
            {errors.standardWorkMinutes && (
              <p className="text-xs text-status-danger font-mono">
                {errors.standardWorkMinutes.message}
              </p>
            )}
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
            form="work-schedule-form"
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer"
            disabled={isSubmitting || isLoadingSchedule}
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

'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { CalendarPlus, Loader2, Calendar } from 'lucide-react';
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
  const t = useTranslations('leave');
  const tCommon = useTranslations('common');
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
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
        <DialogHeader className="shrink-0 pr-10">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-md bg-primary/10 text-primary border border-primary/20">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <DialogTitle className="text-sm font-semibold">{t('requestLeave')}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('subtitleEmployee')}
          </DialogDescription>
        </DialogHeader>

        <form
          id="leave-request-form"
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2"
        >
          {/* Tipe Cuti */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground font-mono">
              {t('leaveType')} <span className="text-destructive">*</span>
            </label>
            <Select
              value={selectedLeaveType}
              onValueChange={(val) => {
                if (val) setValue('leaveType', val as LeaveType, { shouldValidate: true });
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full h-9 font-mono text-xs">
                <SelectValue placeholder={t('leaveType')}>
                  {selectedLeaveType === 'ANNUAL'
                    ? t('annual')
                    : selectedLeaveType === 'SICK'
                    ? t('sick')
                    : selectedLeaveType === 'UNPAID'
                    ? t('unpaid')
                    : selectedLeaveType === 'MATERNITY'
                    ? t('maternity')
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANNUAL">{t('annual')}</SelectItem>
                <SelectItem value="SICK">{t('sick')}</SelectItem>
                <SelectItem value="UNPAID">{t('unpaid')}</SelectItem>
                <SelectItem value="MATERNITY">{t('maternity')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.leaveType && (
              <p className="text-xs text-status-danger font-mono">{errors.leaveType.message}</p>
            )}
          </div>

          {/* Date Range Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground font-mono">
              {t('period')} <span className="text-destructive">*</span>
            </label>
            <DateRangePicker
              from={startDate}
              to={endDate}
              onChange={({ from, to }) => {
                setValue('startDate', from, { shouldValidate: true });
                setValue('endDate', to, { shouldValidate: true });
              }}
              disabled={isSubmitting}
              placeholder={t('period')}
            />
            {(errors.startDate || errors.endDate) && (
              <p className="text-xs text-status-danger font-mono">
                {errors.startDate?.message || errors.endDate?.message}
              </p>
            )}
          </div>

          {/* Duration Summary Badge */}
          {dayCount > 0 && (
            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-between text-xs text-primary font-mono">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{t('duration')}:</span>
              </div>
              <Badge className="bg-primary text-primary-foreground font-semibold font-mono text-xs">
                {t('calendarDays', { count: dayCount })}
              </Badge>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground font-mono">
              {t('reason')} <span className="text-destructive">*</span>
            </label>
            <textarea
              className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-xs font-mono shadow-2xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 min-h-24 outline-none"
              placeholder={t('reasonPlaceholder')}
              {...register('reason')}
              disabled={isSubmitting}
            />
            {errors.reason && (
              <p className="text-xs text-status-danger font-mono">{errors.reason.message}</p>
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
            form="leave-request-form"
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

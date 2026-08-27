'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Timer,
  Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTodayAttendance } from '@/hooks/use-attendance';
import { useWorkSchedule } from '@/hooks/use-work-schedule';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AttendanceActionDialog } from './attendance-action-dialog';

export function AttendanceWidget() {
  const currentUser = useAuthStore((state) => state.user);
  const employeeId = currentUser?.employeeId;
  const t = useTranslations('attendance');
  const tDash = useTranslations('dashboard');
  const locale = useLocale();

  // Real-time current clock
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: todayAttendance, isLoading: isLoadingAttendance } =
    useTodayAttendance(employeeId);
  const { data: schedule } = useWorkSchedule();

  const [dialogType, setDialogType] = useState<'CHECK_IN' | 'CHECK_OUT' | null>(
    null,
  );

  // Time format helpers
  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // State evaluation
  const hasCheckedIn = !!todayAttendance?.checkIn;
  const hasCheckedOut = !!todayAttendance?.checkOut;

  // Calculate elapsed work minutes
  const calculateElapsedMinutes = () => {
    if (!todayAttendance?.checkIn) return 0;
    const start = new Date(todayAttendance.checkIn).getTime();
    const end = todayAttendance.checkOut
      ? new Date(todayAttendance.checkOut).getTime()
      : currentTime
        ? currentTime.getTime()
        : Date.now();

    const diffMinutes = Math.max(0, Math.floor((end - start) / (1000 * 60)));
    return diffMinutes;
  };

  const elapsedMinutes = calculateElapsedMinutes();
  const targetMinutes = schedule?.standardWorkMinutes ?? 480;
  const progressPercent = Math.min(100, Math.round((elapsedMinutes / targetMinutes) * 100));

  const formatHoursMinutes = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (locale === 'en') {
      if (h === 0) return `${m}m`;
      return `${h}h ${m > 0 ? `${m}m` : ''}`;
    }
    if (h === 0) return `${m}m`;
    return `${h}j ${m > 0 ? `${m}m` : ''}`;
  };

  if (!employeeId) {
    return (
      <div className="rounded-md border border-(--status-warning)/30 bg-status-warning-bg p-3 text-xs flex items-center gap-2 text-status-warning">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Akun login Anda belum terhubung ke data karyawan. Hubungi HR Administrator.</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-4 text-card-foreground">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left Column: Live Clock Console */}
        <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-border pb-3 md:pb-0 md:pr-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase font-mono tracking-wider">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span>{currentTime ? formatDate(currentTime) : '...'}</span>
          </div>

          <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-foreground flex items-center gap-2 tabular-nums">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <span>{currentTime ? formatTime(currentTime.toISOString()) : '--:--:--'}</span>
            <span className="text-[10px] font-sans font-semibold text-muted-foreground">WIB</span>
          </div>

          <div className="text-[11px] text-muted-foreground font-mono">
            {t('workSchedule')}: <strong className="text-foreground">{schedule?.startTime || '09:00'}</strong> ({schedule?.lateToleranceMinutes ?? 15}m grace)
          </div>
        </div>

        {/* Center Column: Status & Progress Tracker */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase font-mono tracking-wider">
              {t('status')}
            </span>

            {!hasCheckedIn ? (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {tDash('notCheckedInYet')}
              </span>
            ) : (
              <StatusBadge status={todayAttendance?.status || 'PRESENT'} />
            )}
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded border border-border bg-muted/20">
              <span className="text-[10px] text-muted-foreground block">{t('checkInTime')}</span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {hasCheckedIn ? formatTime(todayAttendance.checkIn) : '--:--'}
              </span>
            </div>

            <div className="p-2 rounded border border-border bg-muted/20">
              <span className="text-[10px] text-muted-foreground block">{t('checkOutTime')}</span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {hasCheckedOut ? formatTime(todayAttendance.checkOut) : '--:--'}
              </span>
            </div>
          </div>

          {/* Progress */}
          {hasCheckedIn && (
            <div className="space-y-1 pt-0.5 text-[11px] font-mono text-muted-foreground">
              <div className="flex justify-between">
                <span>{t('duration')}: <strong className="text-foreground">{formatHoursMinutes(elapsedMinutes)}</strong></span>
                <span>Target: {formatHoursMinutes(targetMinutes)} ({progressPercent}%)</span>
              </div>
              <Progress value={progressPercent} className="h-1.5 w-full bg-muted" />
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-col justify-center items-stretch md:items-end gap-2 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
          {!hasCheckedIn ? (
            <Button
              onClick={() => setDialogType('CHECK_IN')}
              className="w-full md:w-40 bg-status-success hover:opacity-90 text-white font-semibold text-xs h-9 rounded-md cursor-pointer"
              disabled={isLoadingAttendance}
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              {t('checkIn')}
            </Button>
          ) : !hasCheckedOut ? (
            <Button
              onClick={() => setDialogType('CHECK_OUT')}
              className="w-full md:w-40 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs h-9 rounded-md cursor-pointer"
              disabled={isLoadingAttendance}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              {t('checkOut')}
            </Button>
          ) : (
            <div className="w-full md:w-40 text-center p-2 rounded border border-(--status-success)/30 bg-status-success-bg text-status-success text-xs font-mono font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{tDash('shiftComplete')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      {dialogType && (
        <AttendanceActionDialog
          open={!!dialogType}
          onOpenChange={(open) => !open && setDialogType(null)}
          type={dialogType}
        />
      )}
    </div>
  );
}

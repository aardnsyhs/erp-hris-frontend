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
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTodayAttendance } from '@/hooks/use-attendance';
import { useWorkSchedule } from '@/hooks/use-work-schedule';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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
    if (h === 0) return `${m} menit`;
    return `${h} jam ${m > 0 ? `${m} menit` : ''}`;
  };

  if (!employeeId) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Akun login Anda belum terhubung ke data karyawan. Hubungi HR Administrator.
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border overflow-hidden shadow-xs bg-card text-card-foreground">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left Column: Live Clock & Date */}
          <div className="space-y-2 border-b lg:border-b-0 lg:border-r border-border pb-4 lg:pb-0 lg:pr-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentTime ? formatDate(currentTime) : '...'}</span>
            </div>

            <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-foreground flex items-center gap-2">
              <Clock className="w-7 h-7 text-primary shrink-0" />
              <span>{currentTime ? formatTime(currentTime.toISOString()) : '--:--:--'}</span>
              <span className="text-xs font-sans font-semibold text-muted-foreground">WIB</span>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>
                {t('workSchedule')}: <strong>{schedule?.startTime || '09:00'} WIB</strong> ({schedule?.lateToleranceMinutes ?? 15}m)
              </span>
            </div>
          </div>

          {/* Center Column: Dynamic Working Status & Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('status')}
              </span>

              {!hasCheckedIn ? (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {tDash('notCheckedInYet')}
                </Badge>
              ) : !hasCheckedOut ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('statusPresent')}
                </Badge>
              ) : (
                <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {tDash('completeAttendance')}
                </Badge>
              )}
            </div>

            {/* Check-In / Check-Out Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] text-muted-foreground block">{t('checkInTime')}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-bold font-mono text-foreground">
                    {hasCheckedIn ? formatTime(todayAttendance.checkIn) : '--:--'}
                  </span>
                  {hasCheckedIn && (
                    <Badge
                      className={`text-[10px] px-1.5 py-0 ${
                        todayAttendance.status === 'LATE'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {todayAttendance.status === 'LATE' ? t('statusLate') : t('statusPresent')}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] text-muted-foreground block">{t('checkOutTime')}</span>
                <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                  {hasCheckedOut ? formatTime(todayAttendance.checkOut) : '--:--'}
                </span>
              </div>
            </div>

            {/* Working Hours Progress Bar */}
            {hasCheckedIn && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                    {t('duration')}: <strong>{formatHoursMinutes(elapsedMinutes)}</strong>
                  </span>
                  <span>Target: {formatHoursMinutes(targetMinutes)} ({progressPercent}%)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      hasCheckedOut
                        ? 'bg-primary'
                        : progressPercent >= 100
                        ? 'bg-emerald-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contextual Action Buttons */}
          <div className="flex flex-col justify-center items-stretch lg:items-end gap-3 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
            {!hasCheckedIn ? (
              <Button
                onClick={() => setDialogType('CHECK_IN')}
                size="lg"
                className="w-full lg:w-48 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs h-12 text-sm cursor-pointer"
                disabled={isLoadingAttendance}
              >
                <LogIn className="w-5 h-5 mr-2" />
                {t('checkIn')}
              </Button>
            ) : !hasCheckedOut ? (
              <Button
                onClick={() => setDialogType('CHECK_OUT')}
                size="lg"
                className="w-full lg:w-48 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs h-12 text-sm cursor-pointer"
                disabled={isLoadingAttendance}
              >
                <LogOut className="w-5 h-5 mr-2" />
                {t('checkOut')}
              </Button>
            ) : (
              <div className="w-full lg:w-48 text-center p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-primary" />
                <span className="font-semibold">{tDash('completeAttendance')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Action Dialog */}
      {dialogType && (
        <AttendanceActionDialog
          open={!!dialogType}
          onOpenChange={(open) => !open && setDialogType(null)}
          type={dialogType}
        />
      )}
    </Card>
  );
}

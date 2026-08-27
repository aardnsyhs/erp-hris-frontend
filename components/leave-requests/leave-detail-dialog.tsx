'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { LeaveRequest } from '@/types/leave-request';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LeaveDetailDialogProps {
  leaveRequest: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveDetailDialog({
  leaveRequest,
  open,
  onOpenChange,
}: LeaveDetailDialogProps) {
  const t = useTranslations('leave');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  if (!leaveRequest) return null;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(dateStr));
  };

  // Duration
  const calculateDays = () => {
    const start = new Date(leaveRequest.startDate).getTime();
    const end = new Date(leaveRequest.endDate).getTime();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'ANNUAL':
        return t('annual');
      case 'SICK':
        return t('sick');
      case 'UNPAID':
        return t('unpaid');
      case 'MATERNITY':
        return t('maternity');
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="gap-2 shrink-0 pr-10 sm:pr-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <DialogTitle className="truncate text-base font-bold text-foreground">
                {t('detailTitle')}
              </DialogTitle>
            </div>
            <div className="shrink-0 self-start sm:self-auto">
              {leaveRequest.status === 'APPROVED' ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 text-xs whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('statusApproved')}
                </Badge>
              ) : leaveRequest.status === 'REJECTED' ? (
                <Badge variant="destructive" className="gap-1 text-xs whitespace-nowrap">
                  <XCircle className="w-3.5 h-3.5" />
                  {t('statusRejected')}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-xs whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" />
                  {t('statusPending')}
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('detailSubtitle')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 -mr-2 pr-4 my-2">
          <div className="space-y-4 py-1 text-sm">
            {/* Section 1: Karyawan */}
            <div className="p-3 rounded-xl bg-card border border-border space-y-1.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {t('applicantInfo')}
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">
                    {leaveRequest.employee?.fullName || 'Karyawan'}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    NIP: {leaveRequest.employee?.nip} • {leaveRequest.employee?.jobTitle}
                  </p>
                </div>
                {leaveRequest.employee?.department?.name && (
                  <Badge variant="outline" className="text-xs">
                    {leaveRequest.employee.department.name}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Section 2: Informasi Cuti */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground block">{t('leaveType')}</span>
                <p className="font-semibold text-foreground mt-0.5 text-xs sm:text-sm">
                  {getLeaveTypeLabel(leaveRequest.leaveType)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground block">{t('duration')}</span>
                <p className="font-semibold text-foreground mt-0.5 text-xs sm:text-sm">
                  {t('calendarDays', { count: calculateDays() })}
                </p>
              </div>
            </div>

            {/* Section 3: Periode Cuti */}
            <div className="p-3 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
              <span className="text-[11px] font-semibold text-muted-foreground block">{t('period')}</span>
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>{formatDate(leaveRequest.startDate)}</span>
                <span>{tCommon('to')}</span>
                <span>{formatDate(leaveRequest.endDate)}</span>
              </div>
            </div>

            {/* Section 4: Alasan Pengajuan */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">{t('reason')}:</span>
              <p className="p-3 rounded-xl bg-card border border-border text-xs text-foreground leading-relaxed shadow-2xs">
                {leaveRequest.reason}
              </p>
            </div>

            {/* Section 5: Riwayat Approver (Jika sudah di-approve / di-reject) */}
            {leaveRequest.status !== 'PENDING' && (
              <>
                <Separator />
                <div
                  className={`p-3 rounded-xl border space-y-2 shadow-2xs ${leaveRequest.status === 'APPROVED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                      : 'bg-destructive/10 border-destructive/30 text-destructive-foreground'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">
                      {leaveRequest.status === 'APPROVED' ? t('approvedBy') : t('rejectedBy')}
                    </span>
                    <span className="text-[11px] opacity-75">
                      {formatDateTime(leaveRequest.approvedAt || leaveRequest.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs font-medium">
                    {leaveRequest.approver?.fullName || 'Manager / HR Admin'}{' '}
                    {leaveRequest.approver?.nip ? `(${leaveRequest.approver.nip})` : ''}
                  </p>

                  {leaveRequest.status === 'REJECTED' && leaveRequest.rejectionReason && (
                    <div className="pt-2 border-t border-destructive/30">
                      <span className="text-[11px] font-semibold block text-destructive">
                        {t('rejectionReason')}
                      </span>
                      <p className="text-xs mt-0.5 text-foreground">
                        {leaveRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 p-4 border-t border-border bg-card flex flex-col sm:flex-row sm:justify-end -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 rounded-b-xl gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto min-h-11 px-6 text-sm font-medium cursor-pointer"
          >
            {tCommon('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

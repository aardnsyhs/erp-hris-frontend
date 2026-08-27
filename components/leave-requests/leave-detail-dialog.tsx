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
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LongDialogContent,
  LongDialogHeader,
  LongDialogBody,
  LongDialogFooter,
} from '@/components/shared/dialog-layout';

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
      <LongDialogContent className="sm:max-w-3xl">
        <LongDialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 border border-primary/20">
                <FileText className="w-4 h-4" />
              </div>
              <DialogTitle className="truncate text-sm font-semibold text-foreground">
                {t('detailTitle')}
              </DialogTitle>
            </div>
            <div className="shrink-0 self-start sm:self-auto">
              {leaveRequest.status === 'APPROVED' ? (
                <Badge className="bg-status-success-bg text-status-success border-(--status-success)/30 gap-1 text-[10px] font-mono whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('statusApproved')}
                </Badge>
              ) : leaveRequest.status === 'REJECTED' ? (
                <Badge variant="destructive" className="gap-1 text-[10px] font-mono whitespace-nowrap bg-status-danger text-white">
                  <XCircle className="w-3 h-3" />
                  {t('statusRejected')}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-status-warning-bg text-status-warning border-(--status-warning)/30 gap-1 text-[10px] font-mono whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {t('statusPending')}
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {t('detailSubtitle')}
          </DialogDescription>
        </LongDialogHeader>

        <LongDialogBody className="text-xs font-mono">
          {/* Section 1: Karyawan */}
          <div className="p-3.5 rounded-md bg-card border border-border space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t('applicantInfo')}
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground text-xs">
                  {leaveRequest.employee?.fullName || 'Karyawan'}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  NIP: {leaveRequest.employee?.nip} • {leaveRequest.employee?.jobTitle}
                </p>
              </div>
              {leaveRequest.employee?.department?.name && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  {leaveRequest.employee.department.name}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Section 2: Informasi Cuti */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md bg-card border border-border shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground block">{t('leaveType')}</span>
              <p className="font-semibold text-foreground mt-0.5 text-xs">
                {getLeaveTypeLabel(leaveRequest.leaveType)}
              </p>
            </div>

            <div className="p-3 rounded-md bg-card border border-border shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground block">{t('duration')}</span>
              <p className="font-semibold text-primary mt-0.5 text-xs">
                {tCommon('days', { count: calculateDays() })}
              </p>
            </div>
          </div>

          {/* Tanggal Mulai - Selesai */}
          <div className="p-3.5 rounded-md bg-muted/40 border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {t('startDate')}:
              </span>
              <span className="font-semibold text-foreground">
                {formatDate(leaveRequest.startDate)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {t('endDate')}:
              </span>
              <span className="font-semibold text-foreground">
                {formatDate(leaveRequest.endDate)}
              </span>
            </div>
          </div>

          {/* Alasan Cuti */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t('reason')}
            </span>
            <div className="p-3 rounded-md bg-card border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {leaveRequest.reason || '-'}
            </div>
          </div>

          {/* Section 3: Status Approver info */}
          {leaveRequest.status !== 'PENDING' && (
            <>
              <Separator />
              <div
                className={`p-3.5 rounded-md border space-y-2 ${
                  leaveRequest.status === 'APPROVED'
                    ? 'bg-status-success-bg border-(--status-success)/30 text-status-success'
                    : 'bg-status-danger-bg border-(--status-danger)/30 text-status-danger'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {leaveRequest.status === 'APPROVED' ? t('approvedBy') : t('rejectedBy')}
                  </span>
                  <span className="text-[10px] opacity-75">
                    {formatDateTime(leaveRequest.approvedAt || leaveRequest.updatedAt)}
                  </span>
                </div>
                <p className="text-xs font-medium">
                  {leaveRequest.approver?.fullName || 'Manager / HR Admin'}{' '}
                  {leaveRequest.approver?.nip ? `(${leaveRequest.approver.nip})` : ''}
                </p>

                {leaveRequest.status === 'REJECTED' && leaveRequest.rejectionReason && (
                  <div className="pt-2 border-t border-destructive/30">
                    <span className="text-[10px] font-semibold block text-destructive">
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
        </LongDialogBody>

        <LongDialogFooter>
          <div className="flex w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-11 w-full sm:w-auto font-mono text-xs cursor-pointer"
            >
              {tCommon('close')}
            </Button>
          </div>
        </LongDialogFooter>
      </LongDialogContent>
    </Dialog>
  );
}

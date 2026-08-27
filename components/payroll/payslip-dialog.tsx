'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Receipt,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Payroll } from '@/types/payroll';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

interface PayslipDialogProps {
  payroll: Payroll | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayslipDialog({
  payroll,
  open,
  onOpenChange,
}: PayslipDialogProps) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  if (!payroll) return null;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const formatCurrency = (val: number | string | undefined | null) => {
    if (val === undefined || val === null || val === '') return 'Rp 0';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const basic = Number(payroll.basicSalary) || 0;
  const allowances = Number(payroll.allowances) || 0;
  const deductions = Number(payroll.deductions) || 0;
  const net = Number(payroll.netSalary) || (basic + allowances - deductions);

  // If basicSalary is 0 or null and user only has basic view rights (or backend hid numbers)
  const hasSalaryDetails = basic > 0 || allowances > 0 || deductions > 0 || net > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <LongDialogContent className="sm:max-w-2xl">
        <LongDialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 border border-primary/20">
                <Receipt className="w-4 h-4" />
              </div>
              <DialogTitle className="truncate text-sm font-semibold text-foreground">
                {t('payslipTitle')}
              </DialogTitle>
            </div>
            <div className="shrink-0 self-start sm:self-auto">
              {payroll.status === 'PAID' ? (
                <Badge className="bg-status-success-bg text-status-success border-(--status-success)/30 gap-1 text-[10px] font-mono whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('statusPaid')}
                </Badge>
              ) : payroll.status === 'PROCESSED' ? (
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 text-[10px] font-mono whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {t('statusProcessed')}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-status-warning-bg text-status-warning border-(--status-warning)/30 gap-1 text-[10px] font-mono whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {t('statusDraft')}
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {t('payslipSubtitle')}
          </DialogDescription>
        </LongDialogHeader>

        <LongDialogBody className="text-xs font-mono">
          {/* Section 1: Employee Header */}
          <div className="p-3.5 rounded-md bg-card border border-border space-y-1 shadow-2xs">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {t('recipient')}
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground text-xs">
                  {payroll.employee?.fullName || 'Karyawan'}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  NIP: {payroll.employee?.nip} • {payroll.employee?.jobTitle}
                </p>
              </div>
              {payroll.employee?.department?.name && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  {payroll.employee.department.name}
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Section 2: Period & Payment Date */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-md bg-card border border-border space-y-0.5 shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground block">
                {t('period')}
              </span>
              <p className="text-xs font-semibold text-foreground">
                {formatDate(payroll.periodStart)} – {formatDate(payroll.periodEnd)}
              </p>
            </div>

            <div className="p-3 rounded-md bg-card border border-border space-y-0.5 shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground block">
                {t('paymentDate')}
              </span>
              <p className="text-xs font-semibold text-foreground">
                {payroll.paymentDate ? formatDate(payroll.paymentDate) : '-'}
              </p>
            </div>
          </div>

          {/* Section 3: Salary Breakdown / Privacy Notice */}
          {hasSalaryDetails ? (
            <div className="space-y-3">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {t('breakdown')}
              </span>

              <div className="p-4 rounded-md bg-card border border-border space-y-3 shadow-2xs">
                {/* Basic Salary */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t('basicSalary')}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(basic)}</span>
                </div>

                {/* Allowances */}
                <div className="flex items-center justify-between text-xs text-status-success">
                  <span className="flex items-center gap-1">
                    (+) {t('allowances')}
                  </span>
                  <span className="font-semibold">{formatCurrency(allowances)}</span>
                </div>

                {/* Deductions */}
                <div className="flex items-center justify-between text-xs text-status-danger">
                  <span className="flex items-center gap-1">
                    (-) {t('deductions')}
                  </span>
                  <span className="font-semibold">{formatCurrency(deductions)}</span>
                </div>

                <Separator />

                {/* Net Take Home Pay */}
                <div className="pt-1 flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground">{t('netSalary')}</span>
                  <span className="font-bold text-primary font-mono text-base">
                    {formatCurrency(net)}
                  </span>
                </div>

                <div className="pt-2 text-[10px] text-muted-foreground border-t border-dashed border-border flex items-center justify-between">
                  <span>{t('netFormula')}</span>
                  <div className="flex items-center gap-1 text-primary">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{t('verified')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Privacy Protection Card for Managers viewing team members */
            <div className="p-4 rounded-md bg-primary/10 border border-primary/20 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {t('protectedInfo')}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">
                  {t('protectedDesc')}
                </p>
              </div>
            </div>
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

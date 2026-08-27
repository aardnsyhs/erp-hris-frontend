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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const hasFinancialData =
    payroll.basicSalary !== undefined && payroll.netSalary !== undefined;

  const basic = Number(payroll.basicSalary ?? 0);
  const allowances = Number(payroll.allowances ?? 0);
  const deductions = Number(payroll.deductions ?? 0);
  const netSalary = Number(payroll.netSalary ?? 0);
  const isNegativeNet = netSalary < 0;

  const formatCurrency = (val: number) => {
    const formatted = Math.abs(val).toLocaleString(locale === 'en' ? 'en-US' : 'id-ID');
    if (val < 0) {
      return `(Rp ${formatted})`;
    }
    return `Rp ${formatted}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="gap-2 shrink-0 pr-10 sm:pr-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <DialogTitle className="truncate text-base font-bold text-foreground">
                {t('payslipTitle')}
              </DialogTitle>
            </div>
            <div className="shrink-0 self-start sm:self-auto">
              {payroll.status === 'PAID' ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 text-xs whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('statusPaid')}
                </Badge>
              ) : payroll.status === 'PROCESSED' ? (
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" />
                  {t('statusProcessed')}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-xs whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" />
                  {t('statusDraft')}
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('payslipSubtitle')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 -mr-2 pr-4 my-2">
          <div className="space-y-4 py-1 text-sm">
            {/* Section 1: Employee Header */}
            <div className="p-3 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {t('recipient')}
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">
                    {payroll.employee?.fullName || 'Karyawan'}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    NIP: {payroll.employee?.nip} • {payroll.employee?.jobTitle}
                  </p>
                </div>
                {payroll.employee?.department?.name && (
                  <Badge variant="outline" className="text-xs">
                    {payroll.employee.department.name}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Section 2: Period & Payment Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-card border border-border space-y-0.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {t('period')}
                </span>
                <p className="text-xs font-semibold text-foreground">
                  {formatDate(payroll.periodStart)} – {formatDate(payroll.periodEnd)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border space-y-0.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {t('paymentDate')}
                </span>
                <p className="text-xs font-semibold text-foreground">
                  {payroll.paymentDate ? formatDate(payroll.paymentDate) : t('notPaidYet')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Section 3: Financial Details OR Privacy Card */}
            {hasFinancialData ? (
              <div className="space-y-3">
                {/* Negative Net Salary Alert */}
                {isNegativeNet && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('negativeNetWarningTitle')}</AlertTitle>
                    <AlertDescription>
                      {t('negativeNetWarningDesc')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Earnings & Deductions Breakdown */}
                <div className="p-4 rounded-xl border border-border space-y-2.5 bg-card text-card-foreground shadow-2xs">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{t('basicSalary')}</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatCurrency(basic)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{t('allowances')}</span>
                    <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(allowances)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{t('deductions')}</span>
                    <span className="font-mono font-medium text-destructive">
                      -{formatCurrency(deductions)}
                    </span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">
                      {t('netSalary')}
                    </span>
                    <span
                      className={`font-mono font-bold text-base ${
                        isNegativeNet
                          ? 'text-destructive'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {formatCurrency(netSalary)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Privacy Protection Card for Managers viewing team members */
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
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

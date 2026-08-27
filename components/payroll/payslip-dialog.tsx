'use client';

import React from 'react';
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
  if (!payroll) return null;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
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
    if (val < 0) {
      return `(Rp ${Math.abs(val).toLocaleString('id-ID')})`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Slip Gaji Karyawan
            </DialogTitle>
            {payroll.status === 'PAID' ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sudah Dibayar (PAID)
              </Badge>
            ) : payroll.status === 'PROCESSED' ? (
              <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 gap-1">
                <Clock className="w-3.5 h-3.5" />
                Diproses (PROCESSED)
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 gap-1">
                <Clock className="w-3.5 h-3.5" />
                Draft (DRAFT)
              </Badge>
            )}
          </div>
          <DialogDescription>
            Dokumen resmi rincian kompensasi dan pemotongan gaji karyawan.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-4 py-2 text-sm">
            {/* Section 1: Employee Header */}
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Penerima Gaji
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100">
                    {payroll.employee?.fullName || 'Karyawan'}
                  </p>
                  <p className="text-xs text-neutral-500 font-mono">
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
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-0.5">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Periode Gaji
                </span>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {formatDate(payroll.periodStart)} s/d {formatDate(payroll.periodEnd)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-0.5">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Tanggal Pembayaran
                </span>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {payroll.paymentDate ? formatDate(payroll.paymentDate) : 'Belum Ditransfer'}
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
                    <AlertTitle>Perhatian: Gaji Bersih Bernilai Negatif</AlertTitle>
                    <AlertDescription>
                      Total pemotongan melebihi jumlah pendapatan kotor (gaji pokok + tunjangan). Perlu peninjauan khusus oleh HR Administrator.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Earnings & Deductions Breakdown */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2.5 bg-white dark:bg-neutral-900 shadow-2xs">
                  <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400">
                    <span>Gaji Pokok (Snapshot)</span>
                    <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(basic)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400">
                    <span>Tunjangan Tambahan (+)</span>
                    <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(allowances)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400">
                    <span>Potongan Gaji (-)</span>
                    <span className="font-mono font-medium text-red-600 dark:text-red-400">
                      -{formatCurrency(deductions)}
                    </span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Gaji Bersih (Take Home Pay)
                    </span>
                    <span
                      className={`font-mono font-bold text-base ${
                        isNegativeNet
                          ? 'text-red-600 dark:text-red-400'
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
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    Informasi Finansial Dilindungi
                  </h4>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-1 max-w-sm mx-auto">
                    Sesuai kebijakan kepatuhan data HRIS, nominal rincian gaji anggota tim dirahasiakan dan hanya dapat diakses oleh HR Administrator serta karyawan yang bersangkutan.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

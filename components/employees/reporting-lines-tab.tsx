'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Network,
  Plus,
  Calendar,
  UserCheck,
  Mail,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  useReportingLines,
  useCreateReportingLine,
} from '@/hooks/use-reporting-lines';
import { useEmployees } from '@/hooks/use-employees';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ReportingLinesTabProps {
  employeeId: string;
  isHrAdmin: boolean;
}

export function ReportingLinesTab({
  employeeId,
  isHrAdmin,
}: ReportingLinesTabProps) {
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const { data: lines = [], isLoading } = useReportingLines(employeeId);
  const { data: empData } = useEmployees({ limit: 200 });
  const allEmployees = empData?.data || [];

  const createReportingLine = useCreateReportingLine(employeeId);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [managerId, setManagerId] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [isPrimary, setIsPrimary] = useState(true);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Sekarang';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const eligibleManagers = allEmployees.filter((e) => e.id !== employeeId);
  const currentActivePrimary = lines.find(
    (l) => l.isPrimary && l.effectiveTo === null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerId || !effectiveFrom) {
      toast.error('Atasan/Manager dan tanggal efektif wajib diisi');
      return;
    }

    if (managerId === employeeId) {
      toast.error('Karyawan tidak dapat dijadikan atasan untuk dirinya sendiri');
      return;
    }

    try {
      await createReportingLine.mutateAsync({
        managerId,
        effectiveFrom,
        isPrimary,
      });

      toast.success('Garis pelaporan berhasil diperbarui');
      setIsDialogOpen(false);
      setManagerId('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Gagal menyimpan garis pelaporan';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Garis Pelaporan & Struktur Atasan Langsung
          </h3>
          <p className="text-xs text-muted-foreground">
            Hierarki direct manager dan rekam jejak jalur supervisi karyawan.
          </p>
        </div>

        {isHrAdmin && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Atur Atasan Baru
          </Button>
        )}
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          <strong>Catatan Kebijakan:</strong> Garis pelaporan berfungsi sebagai data struktur organisasi dan jalur supervisi langsung. Persetujuan cuti dan visibilitas absensi tetap mengacu pada departemen penempatan.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center bg-muted/20">
          <Network className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-foreground">
            Belum ada garis pelaporan yang ditentukan
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {isHrAdmin
              ? 'Tentukan atasan langsung untuk karyawan ini guna membentuk bagan hierarki supervisi.'
              : 'Atasan langsung belum ditentukan oleh HR Admin.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Active Direct Manager Card */}
          {currentActivePrimary && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-card-foreground shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Atasan Langsung Saat Ini (Direct Manager)
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-normal text-[11px]">
                  Aktif
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-foreground">
                    {currentActivePrimary.manager?.fullName || 'Manager'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-mono">{currentActivePrimary.manager?.nip}</span>
                    <span>{currentActivePrimary.manager?.jobTitle}</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {currentActivePrimary.manager?.email}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right self-start sm:self-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 sm:justify-end">
                    <Calendar className="h-3.5 w-3.5 text-primary/70" />
                    Melapor Sejak:
                  </span>
                  <strong className="text-foreground font-medium">
                    {formatDate(currentActivePrimary.effectiveFrom)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Riwayat Supervisi & Atasan Sebelumnya
            </h4>

            <div className="relative pl-6 border-l-2 border-border space-y-4">
              {lines.map((item) => {
                const isActive = item.effectiveTo === null;
                return (
                  <div key={item.id} className="relative">
                    <div
                      className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background ${
                        isActive
                          ? 'border-primary ring-4 ring-primary/20 bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    />

                    <div className="p-3 rounded-lg border bg-card text-card-foreground shadow-xs flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {item.manager?.fullName}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            ({item.manager?.nip})
                          </span>
                          {item.isPrimary && (
                            <Badge variant="outline" className="text-[10px]">
                              Primary Supervisor
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.manager?.jobTitle} • {item.manager?.email}
                        </p>
                      </div>

                      <div className="text-left sm:text-right text-[11px] text-muted-foreground shrink-0">
                        <p className="flex items-center gap-1 sm:justify-end">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.effectiveFrom)} - {formatDate(item.effectiveTo)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dialog Atur Atasan */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Atur Atasan Langsung Baru</DialogTitle>
              <DialogDescription>
                Pilih atasan/manager langsung yang akan membawahi karyawan ini.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-3">
              <div className="grid gap-1">
                <label className="text-xs font-medium text-foreground">
                  Pilih Atasan / Manager <span className="text-destructive">*</span>
                </label>
                <Select
                  value={managerId}
                  onValueChange={(val) => setManagerId(val || '')}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilih atasan langsung" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleManagers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.fullName} ({m.nip}) - {m.jobTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-foreground">
                  Tanggal Mulai Melapor <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="h-9"
                  required
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Jadikan Atasan Utama (Primary Reporting Line)</span>
                </label>
                <p className="text-[11px] text-muted-foreground mt-1 ml-6">
                  Jika dicentang, atasan utama sebelumnya akan otomatis ditutup masa tugasnya.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={createReportingLine.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={createReportingLine.isPending}>
                {createReportingLine.isPending
                  ? 'Menyimpan...'
                  : 'Simpan Garis Pelaporan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  FileCheck2,
  Plus,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Ban,
  Download,
} from 'lucide-react';
import {
  useContracts,
  useCreateContract,
  useUpdateContractStatus,
} from '@/hooks/use-contracts';
import { useEmployeeDocuments, downloadEmployeeDocument } from '@/hooks/use-employee-documents';
import {
  ContractStatus,
  ContractType,
  EmploymentContract,
} from '@/types/contract';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface ContractsTabProps {
  employeeId: string;
  isHrAdmin: boolean;
  isSelf: boolean;
}

export function ContractsTab({
  employeeId,
  isHrAdmin,
  isSelf,
}: ContractsTabProps) {
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const { data: contracts = [], isLoading } = useContracts(employeeId);
  const { data: docsData } = useEmployeeDocuments(employeeId, { limit: 100 }, isHrAdmin);
  const employeeDocuments = docsData?.data || [];

  const createContract = useCreateContract(employeeId);
  const updateStatus = useUpdateContractStatus(employeeId);

  // Create Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [contractType, setContractType] = useState<ContractType>('CONTRACT');
  const [contractNumber, setContractNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ContractStatus>('ACTIVE');
  const [renewalReminderDate, setRenewalReminderDate] = useState('');
  const [notes, setNotes] = useState('');
  const [documentId, setDocumentId] = useState<string>('');

  // Status Change Dialog state
  const [statusDialogContract, setStatusDialogContract] =
    useState<EmploymentContract | null>(null);
  const [newStatus, setNewStatus] = useState<ContractStatus>('RENEWED');
  const [statusNotes, setStatusNotes] = useState('');

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (s: ContractStatus) => {
    switch (s) {
      case 'ACTIVE':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Aktif
          </Badge>
        );
      case 'RENEWED':
        return (
          <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1">
            <RefreshCw className="h-3 w-3" />
            Diperbarui (Renewed)
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Kedaluwarsa (Expired)
          </Badge>
        );
      case 'TERMINATED':
        return (
          <Badge variant="destructive" className="gap-1">
            <Ban className="h-3 w-3" />
            Diakhiri (Terminated)
          </Badge>
        );
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractNumber.trim() || !startDate) {
      toast.error('Nomor kontrak dan tanggal mulai wajib diisi');
      return;
    }

    try {
      await createContract.mutateAsync({
        contractType,
        contractNumber: contractNumber.trim(),
        startDate,
        endDate: endDate || undefined,
        status,
        renewalReminderDate: renewalReminderDate || undefined,
        notes: notes.trim() || undefined,
        documentId: documentId || undefined,
      });

      toast.success('Kontrak kerja berhasil dibuat');
      setIsCreateOpen(false);
      // Reset
      setContractNumber('');
      setStartDate('');
      setEndDate('');
      setRenewalReminderDate('');
      setNotes('');
      setDocumentId('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal membuat kontrak kerja';
      toast.error(msg);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusDialogContract) return;

    try {
      await updateStatus.mutateAsync({
        id: statusDialogContract.id,
        payload: {
          status: newStatus,
          notes: statusNotes.trim() || undefined,
        },
      });

      toast.success('Status kontrak berhasil diperbarui');
      setStatusDialogContract(null);
      setStatusNotes('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Gagal mengubah status kontrak';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Perjanjian & Kontrak Kerja
          </h3>
          <p className="text-xs text-muted-foreground">
            Riwayat kontrak kerja (PKWT/PKWTT/Probation), masa berlaku, dan dokumen hukum terkait.
          </p>
        </div>

        {isHrAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Tambah Kontrak
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center bg-muted/20">
          <FileCheck2 className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-foreground">
            Belum ada data kontrak kerja
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {isHrAdmin
              ? 'Tambahkan kontrak kerja untuk mencatat masa berlaku dan status ikatan kerja karyawan.'
              : 'Belum ada dokumen perjanjian kerja yang tercatat di akun Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {contracts.map((c) => {
            const isTerminal =
              c.status === 'EXPIRED' ||
              c.status === 'TERMINATED' ||
              c.status === 'RENEWED';

            return (
              <div
                key={c.id}
                className="p-4 rounded-lg border bg-card text-card-foreground flex flex-col sm:flex-row justify-between gap-4 shadow-xs"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-sm text-foreground">
                      {c.contractNumber}
                    </span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {c.contractType}
                    </Badge>
                    {getStatusBadge(c.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Periode:{' '}
                        <strong className="text-foreground font-medium">
                          {formatDate(c.startDate)}
                        </strong>{' '}
                        s/d{' '}
                        <strong className="text-foreground font-medium">
                          {c.endDate ? formatDate(c.endDate) : 'Tetap (PKWTT)'}
                        </strong>
                      </span>
                    </div>

                    {c.renewalReminderDate && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <span>
                          Pengingat Perpanjangan:{' '}
                          <strong className="text-foreground font-medium">
                            {formatDate(c.renewalReminderDate)}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {c.notes && (
                    <p className="text-xs text-muted-foreground italic bg-muted/30 px-2.5 py-1.5 rounded border border-border/50">
                      &quot;{c.notes}&quot;
                    </p>
                  )}

                  {c.document && (
                    <div className="pt-1">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary gap-1"
                        onClick={() =>
                          downloadEmployeeDocument(
                            employeeId,
                            c.document!.id,
                            c.document!.fileName,
                          )
                        }
                      >
                        <Download className="h-3.5 w-3.5" />
                        Unduh Lampiran: {c.document.title || c.document.fileName}
                      </Button>
                    </div>
                  )}
                </div>

                {isHrAdmin && !isTerminal && (
                  <div className="flex items-center self-start sm:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStatusDialogContract(c);
                        setNewStatus('RENEWED');
                      }}
                      className="text-xs h-8"
                    >
                      Ubah Status
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Tambah Kontrak Kerja</DialogTitle>
              <DialogDescription>
                Catat perjanjian kerja baru. Sistem akan memeriksa agar tidak ada kontrak aktif yang overlap.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-foreground">
                    Tipe Kontrak <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={contractType}
                    onValueChange={(val) => setContractType(val as ContractType)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTRACT">PKWT (Kontrak)</SelectItem>
                      <SelectItem value="PERMANENT">PKWTT (Tetap)</SelectItem>
                      <SelectItem value="PROBATION">Probation (Percobaan)</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship (Magang)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-foreground">
                    Nomor Kontrak <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. CTR/2026/089"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    className="h-9 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-foreground">
                    Tanggal Mulai <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-foreground">
                    Tanggal Selesai {contractType !== 'PERMANENT' && <span className="text-destructive">*</span>}
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9"
                    disabled={contractType === 'PERMANENT'}
                    required={contractType !== 'PERMANENT'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-foreground">
                    Pengingat Perpanjangan
                  </label>
                  <Input
                    type="date"
                    value={renewalReminderDate}
                    onChange={(e) => setRenewalReminderDate(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-foreground">
                    Lampiran Dokumen
                  </label>
                  <Select
                    value={documentId}
                    onValueChange={(val) => setDocumentId(val || '')}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Pilih dokumen lampiran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Tidak ada lampiran --</SelectItem>
                      {employeeDocuments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.title} ({d.fileName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-foreground">
                  Catatan / Klausul Tambahan
                </label>
                <Textarea
                  placeholder="Keterangan masa percobaan, klausul khusus, dll..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createContract.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={createContract.isPending}>
                {createContract.isPending ? 'Menyimpan...' : 'Simpan Kontrak'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Transition Dialog */}
      <Dialog
        open={!!statusDialogContract}
        onOpenChange={(open) => !open && setStatusDialogContract(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleStatusSubmit}>
            <DialogHeader>
              <DialogTitle>Ubah Status Kontrak Kerja</DialogTitle>
              <DialogDescription>
                Kontrak: <strong className="font-mono text-foreground">{statusDialogContract?.contractNumber}</strong>.
                Perhatian: Status terminal (EXPIRED, TERMINATED, RENEWED) bersifat permanen.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3">
              <div className="grid gap-1">
                <label className="text-xs font-medium text-foreground">
                  Status Baru <span className="text-destructive">*</span>
                </label>
                <Select
                  value={newStatus}
                  onValueChange={(val) => setNewStatus(val as ContractStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status baru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RENEWED">RENEWED (Diperpanjang / Diganti Baru)</SelectItem>
                    <SelectItem value="EXPIRED">EXPIRED (Masa Berlaku Habis)</SelectItem>
                    <SelectItem value="TERMINATED">TERMINATED (Diakhiri Sebelum Waktunya)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-foreground">
                  Alasan Perubahan Status
                </label>
                <Textarea
                  placeholder="Catatan alasan perubahan status kontrak..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatusDialogContract(null)}
                disabled={updateStatus.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={updateStatus.isPending}>
                {updateStatus.isPending ? 'Menyimpan...' : 'Perbarui Status'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

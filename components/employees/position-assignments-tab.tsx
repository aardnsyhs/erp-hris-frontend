'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Briefcase,
  Plus,
  Calendar,
  Layers,
  Building2,
  TrendingUp,
  ArrowRightLeft,
  TrendingDown,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import {
  usePositionAssignments,
  useCreatePositionAssignment,
} from '@/hooks/use-position-assignments';
import { usePositions } from '@/hooks/use-positions';
import { useDepartments } from '@/hooks/use-departments';
import {
  AssignmentType,
  EmployeePositionAssignment,
} from '@/types/position-assignment';
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

interface PositionAssignmentsTabProps {
  employeeId: string;
  isHrAdmin: boolean;
  currentDepartmentId?: string;
}

export function PositionAssignmentsTab({
  employeeId,
  isHrAdmin,
  currentDepartmentId,
}: PositionAssignmentsTabProps) {
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const { data: assignments = [], isLoading } = usePositionAssignments(employeeId);
  const { data: positions = [] } = usePositions({ isActive: true });
  const { data: deptsData } = useDepartments({ limit: 100 });
  const departments = deptsData?.data || [];

  const createAssignment = useCreatePositionAssignment(employeeId);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [positionId, setPositionId] = useState('');
  const [departmentId, setDepartmentId] = useState(currentDepartmentId || '');
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [assignmentType, setAssignmentType] =
    useState<AssignmentType>('PROMOTION');
  const [notes, setNotes] = useState('');

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Sekarang';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getAssignmentTypeBadge = (type: AssignmentType) => {
    switch (type) {
      case 'INITIAL':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1 font-normal">
            <UserCheck className="h-3 w-3" />
            Penugasan Awal (Hire)
          </Badge>
        );
      case 'PROMOTION':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 font-normal">
            <TrendingUp className="h-3 w-3" />
            Promosi
          </Badge>
        );
      case 'TRANSFER':
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 gap-1 font-normal">
            <ArrowRightLeft className="h-3 w-3" />
            Mutasi / Transfer
          </Badge>
        );
      case 'DEMOTION':
        return (
          <Badge variant="destructive" className="gap-1 font-normal">
            <TrendingDown className="h-3 w-3" />
            Demosi
          </Badge>
        );
      case 'REORGANIZATION':
        return (
          <Badge variant="outline" className="gap-1 font-normal">
            <RotateCcw className="h-3 w-3" />
            Reorganisasi
          </Badge>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!positionId || !departmentId || !effectiveFrom) {
      toast.error('Posisi, departemen, dan tanggal efektif wajib diisi');
      return;
    }

    try {
      await createAssignment.mutateAsync({
        positionId,
        departmentId,
        effectiveFrom,
        assignmentType,
        notes: notes.trim() || undefined,
      });

      toast.success('Penugasan posisi berhasil disimpan');
      setIsDialogOpen(false);
      setPositionId('');
      setNotes('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Gagal membuat penugasan posisi';
      toast.error(msg);
    }
  };

  const activeAssignment = assignments.find((a) => a.effectiveTo === null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Riwayat Posisi & Penugasan
          </h3>
          <p className="text-xs text-muted-foreground">
            Catatan penugasan jabatan formal, kenaikan level/promosi, dan perpindahan departemen.
          </p>
        </div>

        {isHrAdmin && (
          <Button
            onClick={() => {
              if (currentDepartmentId && !departmentId) {
                setDepartmentId(currentDepartmentId);
              }
              setIsDialogOpen(true);
            }}
            size="sm"
            className="gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Penugasan Baru
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center bg-muted/20">
          <Briefcase className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-foreground">
            Belum ada data penugasan posisi
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {isHrAdmin
              ? 'Tugaskan karyawan ke jabatan dan departemen formal untuk melacak rekam jejak karir.'
              : 'Belum ada penugasan jabatan yang tercatat.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Assignment Highlight Card */}
          {activeAssignment && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-card-foreground shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Penugasan Posisi Saat Ini
                </span>
                <Badge className="bg-primary text-primary-foreground font-normal text-[11px]">
                  Aktif
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {activeAssignment.position?.title || 'Posisi'}
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-background border text-muted-foreground font-normal">
                      {activeAssignment.position?.code}
                    </span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-primary/70" />
                      {activeAssignment.department?.name || 'Departemen'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-primary/70" />
                      Level {activeAssignment.position?.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary/70" />
                      Sejak {formatDate(activeAssignment.effectiveFrom)}
                    </span>
                  </div>
                </div>

                <div>
                  {getAssignmentTypeBadge(activeAssignment.assignmentType)}
                </div>
              </div>
            </div>
          )}

          {/* Timeline History */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Riwayat Perjalanan Jabatan
            </h4>

            <div className="relative pl-6 border-l-2 border-border space-y-6">
              {assignments.map((item) => {
                const isActive = item.effectiveTo === null;
                return (
                  <div key={item.id} className="relative group">
                    {/* Timeline Node */}
                    <div
                      className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-background ${
                        isActive
                          ? 'border-primary ring-4 ring-primary/20 bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    />

                    <div className="p-3.5 rounded-lg border bg-card text-card-foreground shadow-xs">
                      <div className="flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">
                              {item.position?.title}
                            </span>
                            <Badge variant="outline" className="text-[11px] font-mono">
                              {item.position?.code}
                            </Badge>
                            <Badge variant="secondary" className="text-[11px]">
                              Level {item.position?.level}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Building2 className="h-3 w-3" />
                            {item.department?.name}
                          </p>
                        </div>

                        <div className="text-right sm:text-right self-start sm:self-center">
                          {getAssignmentTypeBadge(item.assignmentType)}
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 sm:justify-end">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.effectiveFrom)} - {formatDate(item.effectiveTo)}
                          </p>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-2.5 pt-2 border-t italic">
                          &quot;{item.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dialog Penugasan Baru */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Penugasan Posisi Baru</DialogTitle>
              <DialogDescription>
                Penugasan baru akan otomatis menutup periode aktif penugasan sebelumnya dan mencatat ke Riwayat Perpindahan Karyawan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-3">
              <div className="grid gap-1">
                <label className="text-xs font-medium text-foreground">
                  Pilih Jabatan / Posisi <span className="text-destructive">*</span>
                </label>
                <Select
                  value={positionId}
                  onValueChange={(val) => setPositionId(val || '')}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilih posisi baru" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} ({p.code}) - Level {p.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-foreground">
                  Departemen Penempatan <span className="text-destructive">*</span>
                </label>
                <Select
                  value={departmentId}
                  onValueChange={(val) => setDepartmentId(val || '')}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-foreground">
                    Tipe Penugasan <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={assignmentType}
                    onValueChange={(val) => setAssignmentType(val as AssignmentType)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROMOTION">Promosi (Naik Jabatan)</SelectItem>
                      <SelectItem value="TRANSFER">Mutasi / Rotasi (Transfer)</SelectItem>
                      <SelectItem value="INITIAL">Penugasan Awal (Hire)</SelectItem>
                      <SelectItem value="DEMOTION">Demosi</SelectItem>
                      <SelectItem value="REORGANIZATION">Reorganisasi Struktur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-foreground">
                    Tanggal Efektif <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-foreground">
                  Catatan / Keterangan Penugasan
                </label>
                <Textarea
                  placeholder="Keterangan SK Direksi, pertimbangan promosi, dll..."
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
                onClick={() => setIsDialogOpen(false)}
                disabled={createAssignment.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={createAssignment.isPending}>
                {createAssignment.isPending
                  ? 'Menyimpan...'
                  : 'Simpan Penugasan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

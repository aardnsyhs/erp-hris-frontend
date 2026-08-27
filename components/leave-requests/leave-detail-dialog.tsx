'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { LeaveRequest } from '@/types/leave-request';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  if (!leaveRequest) return null;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('id-ID', {
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
        return 'Cuti Tahunan (ANNUAL)';
      case 'SICK':
        return 'Cuti Sakit (SICK)';
      case 'UNPAID':
        return 'Cuti Tanpa Gaji (UNPAID)';
      case 'MATERNITY':
        return 'Cuti Melahirkan (MATERNITY)';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Detail Permohonan Cuti
            </DialogTitle>
            {leaveRequest.status === 'APPROVED' ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Disetujui (APPROVED)
              </Badge>
            ) : leaveRequest.status === 'REJECTED' ? (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Ditolak (REJECTED)
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 gap-1">
                <Clock className="w-3.5 h-3.5" />
                Menunggu (PENDING)
              </Badge>
            )}
          </div>
          <DialogDescription>
            Rincian lengkap pengajuan cuti dan riwayat persetujuan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Section 1: Karyawan */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Informasi Pemohon
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900 dark:text-neutral-100">
                  {leaveRequest.employee?.fullName || 'Karyawan'}
                </p>
                <p className="text-xs text-neutral-500 font-mono">
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

          {/* Section 2: Informasi Cuti */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 block">Tipe Cuti</span>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                {getLeaveTypeLabel(leaveRequest.leaveType)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-400 block">Total Durasi</span>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                {calculateDays()} Hari Kalender
              </p>
            </div>
          </div>

          {/* Section 3: Periode Cuti */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <span className="text-[11px] font-semibold text-neutral-400 block">Periode Tanggal Cuti</span>
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium text-xs">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{formatDate(leaveRequest.startDate)}</span>
              <span>s/d</span>
              <span>{formatDate(leaveRequest.endDate)}</span>
            </div>
          </div>

          {/* Section 4: Alasan Pengajuan */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500">Alasan Pengajuan:</span>
            <p className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {leaveRequest.reason}
            </p>
          </div>

          {/* Section 5: Riwayat Approver (Jika sudah di-approve / di-reject) */}
          {leaveRequest.status !== 'PENDING' && (
            <div
              className={`p-3 rounded-xl border space-y-2 ${
                leaveRequest.status === 'APPROVED'
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-200/70 dark:border-red-900 text-red-900 dark:text-red-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">
                  {leaveRequest.status === 'APPROVED' ? 'Disetujui Oleh:' : 'Ditolak Oleh:'}
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
                <div className="pt-2 border-t border-red-200/60 dark:border-red-900/60">
                  <span className="text-[11px] font-semibold block text-red-700 dark:text-red-300">
                    Alasan Penolakan:
                  </span>
                  <p className="text-xs mt-0.5 text-red-800 dark:text-red-200">
                    {leaveRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

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

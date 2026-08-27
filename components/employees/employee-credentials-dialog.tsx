'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  KeyRound,
  ShieldAlert,
  UserCheck,
  Mail,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EmployeeCredentialsDialogProps {
  credentials: {
    fullName: string;
    email: string;
    role: string;
    temporaryPassword?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeCredentialsDialog({
  credentials,
  open,
  onOpenChange,
}: EmployeeCredentialsDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!credentials || !credentials.temporaryPassword) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(credentials.temporaryPassword || '');
    setCopied(true);
    toast.success('Password sementara berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950">
              <UserCheck className="w-5 h-5" />
            </div>
            <DialogTitle>Akun Karyawan Berhasil Dibuat</DialogTitle>
          </div>
          <DialogDescription>
            Karyawan dan akun login sistem telah terdaftar. Berikan kredensial login berikut kepada karyawan yang bersangkutan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Warning Alert */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold">Peringatan Keamanan Penting</p>
              <p className="mt-0.5 leading-relaxed">
                Catat dan simpan password sementara ini sekarang. Demi alasan keamanan dan enkripsi sistem, <strong>password ini tidak akan pernah ditampilkan lagi</strong> setelah dialog ini ditutup.
              </p>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email Login:
              </span>
              <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {credentials.email}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Role Akses:
              </span>
              <Badge variant="outline" className="text-xs font-semibold">
                {credentials.role}
              </Badge>
            </div>

            {/* Temporary Password with Copy Button */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                Password Sementara:
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2.5 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 font-mono font-bold text-base text-indigo-600 dark:text-indigo-400 tracking-wider text-center select-all">
                  {credentials.temporaryPassword}
                </div>
                <Button
                  type="button"
                  onClick={handleCopy}
                  className={`h-11 px-4 text-xs font-semibold cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Disalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Salin Password
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Saya Sudah Menyimpan Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

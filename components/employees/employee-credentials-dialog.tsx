'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const [copied, setCopied] = useState(false);

  if (!credentials || !credentials.temporaryPassword) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(credentials.temporaryPassword || '');
    setCopied(true);
    toast.success(t('copied'));
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <DialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <UserCheck className="w-5 h-5" />
            </div>
            <DialogTitle>{t('credentialsModalTitle')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('credentialsModalDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Account Details Box */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {t('email')}:
              </span>
              <span className="font-mono text-xs font-semibold text-foreground">
                {credentials.email}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {t('role')}:
              </span>
              <Badge variant="outline" className="text-xs font-semibold">
                {credentials.role}
              </Badge>
            </div>

            {/* Temporary Password with Copy Button */}
            <div className="pt-2 border-t border-border space-y-1.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                {t('temporaryPassword')}:
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2.5 rounded-lg bg-muted border border-border font-mono font-bold text-base text-primary tracking-wider text-center select-all">
                  {credentials.temporaryPassword}
                </div>
                <Button
                  type="button"
                  onClick={handleCopy}
                  className={`h-11 px-4 text-xs font-semibold cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      {t('copyCredentials')}
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
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            {tCommon('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

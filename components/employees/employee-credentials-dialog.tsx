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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-10">
          <div className="flex items-center gap-2.5 text-status-success">
            <div className="p-2 rounded-md bg-status-success-bg text-status-success border border-(--status-success)/30">
              <UserCheck className="w-4 h-4" />
            </div>
            <DialogTitle className="text-sm font-semibold">{t('credentialsModalTitle')}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('credentialsModalDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs font-mono py-2">
          {/* Account Details Box */}
          <div className="p-4 rounded-md bg-card border border-border space-y-3 shadow-2xs">
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
              <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                {credentials.role}
              </Badge>
            </div>

            {/* Temporary Password with Copy Button */}
            <div className="pt-2 border-t border-border space-y-1.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-mono">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                {t('temporaryPassword')}:
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2.5 rounded-md bg-muted border border-border font-mono font-bold text-sm text-primary tracking-wider text-center select-all">
                  {credentials.temporaryPassword}
                </div>
                <Button
                  type="button"
                  onClick={handleCopy}
                  className={`min-h-11 px-4 text-xs font-mono font-semibold cursor-pointer ${
                    copied
                      ? 'bg-status-success hover:opacity-90 text-white'
                      : 'bg-primary hover:bg-primary-hover text-primary-foreground'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      {t('copyCredentials')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-md bg-status-warning-bg border border-(--status-warning)/30 flex items-start gap-2 text-status-warning text-xs font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t('credentialsModalWarning')}</span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer"
          >
            {tCommon('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

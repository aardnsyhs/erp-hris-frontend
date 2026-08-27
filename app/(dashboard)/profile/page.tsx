'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import {
  Shield,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useUserProfile, useChangePassword } from '@/hooks/use-auth-profile';
import {
  changePasswordSchema,
  ChangePasswordFormValues,
} from '@/lib/validations/profile';
import { PageHeader } from '@/components/shared/page-header';
import { DetailSection, DetailGridItem } from '@/components/shared/detail-layout';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const tEmp = useTranslations('employees');
  const tAuth = useTranslations('auth');
  const locale = useLocale();

  const { data: user, isLoading } = useUserProfile();
  const changePasswordMutation = useChangePassword();

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmitPassword = async (values: ChangePasswordFormValues) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
    } catch {
      // Toast handled by hook
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const emp = user?.employee;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        badge={
          <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 uppercase tracking-wider">
            <Shield className="w-3 h-3 mr-1 text-primary" />
            {user?.role?.replace('_', ' ') || 'EMPLOYEE'}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Account & Employment Overview */}
        <div className="space-y-5">
          {/* Account Profile Card */}
          <DetailSection title={t('personalData')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailGridItem label={tEmp('fullName')} value={emp?.fullName || user?.email} />
              <DetailGridItem label={tEmp('email')} value={user?.email} mono />
              <DetailGridItem label={tEmp('nip')} value={emp?.nip} mono />
              <DetailGridItem label={tEmp('department')} value={emp?.department?.name} />
              <DetailGridItem label={tEmp('jobTitle')} value={emp?.jobTitle} />
              <DetailGridItem label={tEmp('hireDate')} value={formatDate(emp?.hireDate)} />
              <DetailGridItem label={tEmp('phone')} value={emp?.phone} mono />
              <DetailGridItem
                label={tCommon('status')}
                value={<StatusBadge status={emp?.status || 'ACTIVE'} showDot={false} />}
              />
            </div>
          </DetailSection>

          {/* Security Overview */}
          <DetailSection title={t('sessionSecurity')}>
            <div className="space-y-2 text-xs font-mono text-muted-foreground">
              <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border">
                <span>Account Identifier:</span>
                <span className="font-semibold text-foreground">{user?.id}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border">
                <span>Access Protocol:</span>
                <span className="font-semibold text-foreground">RBAC Enforced</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                {tAuth('securityNotice')}
              </p>
            </div>
          </DetailSection>
        </div>

        {/* Change Password Console */}
        <div>
          <DetailSection
            title={t('changePasswordTitle')}
            description={t('changePasswordSubtitle')}
          >
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('currentPassword')} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPw ? 'text' : 'password'}
                    placeholder={t('currentPasswordPlaceholder')}
                    {...register('currentPassword')}
                    disabled={isSubmitting}
                    className="pr-9 text-xs bg-card font-mono h-8.5 rounded-md"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            aria-label={showCurrentPw ? tAuth('hidePassword') : tAuth('showPassword')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                          />
                        }
                      >
                        {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {showCurrentPw ? tAuth('hidePassword') : tAuth('showPassword')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-destructive font-mono">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('newPassword')} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showNewPw ? 'text' : 'password'}
                    placeholder={t('newPasswordPlaceholder')}
                    {...register('newPassword')}
                    disabled={isSubmitting}
                    className="pr-9 text-xs bg-card font-mono h-8.5 rounded-md"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            aria-label={showNewPw ? tAuth('hidePassword') : tAuth('showPassword')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                          />
                        }
                      >
                        {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {showNewPw ? tAuth('hidePassword') : tAuth('showPassword')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-destructive font-mono">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('confirmPassword')} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder={t('confirmPasswordPlaceholder')}
                    {...register('confirmPassword')}
                    disabled={isSubmitting}
                    className="pr-9 text-xs bg-card font-mono h-8.5 rounded-md"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                            aria-label={showConfirmPw ? tAuth('hidePassword') : tAuth('showPassword')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                          />
                        }
                      >
                        {showConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {showConfirmPw ? tAuth('hidePassword') : tAuth('showPassword')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive font-mono">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground text-xs font-semibold h-9 rounded-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      {tCommon('saving')}
                    </>
                  ) : (
                    t('savePassword')
                  )}
                </Button>
              </div>
            </form>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

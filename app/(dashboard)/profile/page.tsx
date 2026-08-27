'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import {
  User,
  Shield,
  Building2,
  Calendar,
  Phone,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import { useUserProfile, useChangePassword } from '@/hooks/use-auth-profile';
import {
  changePasswordSchema,
  ChangePasswordFormValues,
} from '@/lib/validations/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
      // Toast notification is handled in the mutation hook
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

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'HR_ADMIN':
        return (
          <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-2.5 py-0.5">
            HR Administrator
          </Badge>
        );
      case 'MANAGER':
        return (
          <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-0.5">
            Manager
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-muted text-muted-foreground">
            Employee
          </Badge>
        );
    }
  };

  const emp = user?.employee;

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-5xl">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t('title')}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Ringkasan Akun */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-md mb-3">
                  {emp?.fullName
                    ? emp.fullName
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                    : user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <CardTitle className="text-lg font-bold text-foreground">
                  {emp?.fullName || user?.email}
                </CardTitle>
                <CardDescription className="text-xs font-mono">
                  {emp?.nip ? `NIP: ${emp.nip}` : user?.email}
                </CardDescription>
                <div className="pt-2 flex justify-center">{getRoleBadge(user?.role)}</div>
              </CardHeader>

              <CardContent className="border-t border-border pt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    {tEmp('email')}:
                  </span>
                  <span className="font-medium text-foreground">
                    {user?.email}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    {tEmp('status')}:
                  </span>
                  {user?.isActive ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                      {tEmp('statusActive')}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">
                      {tEmp('statusInactive')}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    Registered:
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(user?.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Rincian Kepegawaian & Ganti Password */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Data Profil Kepegawaian */}
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  {t('personalInfo')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('subtitle')}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="py-6 flex items-center justify-center text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {tCommon('loading')}
                  </div>
                ) : emp ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        {tEmp('fullName')}
                      </span>
                      <p className="font-medium text-foreground text-sm">
                        {emp.fullName}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        {tEmp('nip')}
                      </span>
                      <p className="font-mono font-medium text-foreground text-sm">
                        {emp.nip}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        {tEmp('department')}
                      </span>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span>{emp.department?.name || '-'}</span>
                        {emp.department?.code && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({emp.department.code})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        {tEmp('jobTitle')}
                      </span>
                      <p className="font-medium text-foreground">
                        {emp.jobTitle}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        {tEmp('phone')}
                      </span>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{emp.phone || '-'}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        {tEmp('hireDate')}
                      </span>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{formatDate(emp.hireDate)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
                    Administrator Account (No Employee profile attached).
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator className="my-2" />

            {/* Section 2: Form Ganti Password */}
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <KeyRound className="w-4 h-4 text-primary" />
                  {t('changePassword')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('changePasswordDesc')}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t('currentPassword')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showCurrentPw ? 'text' : 'password'}
                        placeholder={t('currentPassword')}
                        className="pl-9 pr-9 text-xs"
                        {...register('currentPassword')}
                      />
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw(!showCurrentPw)}
                              aria-label={showCurrentPw ? tAuth('hidePassword') : tAuth('showPassword')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            />
                          }
                        >
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </TooltipTrigger>
                        <TooltipContent>
                          {showCurrentPw ? tAuth('hidePassword') : tAuth('showPassword')}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-[11px] text-destructive">{errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        {t('newPassword')}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showNewPw ? 'text' : 'password'}
                          placeholder={t('newPassword')}
                          className="pl-9 pr-9 text-xs"
                          {...register('newPassword')}
                        />
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => setShowNewPw(!showNewPw)}
                                aria-label={showNewPw ? tAuth('hidePassword') : tAuth('showPassword')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              />
                            }
                          >
                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </TooltipTrigger>
                          <TooltipContent>
                            {showNewPw ? tAuth('hidePassword') : tAuth('showPassword')}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {errors.newPassword && (
                        <p className="text-[11px] text-destructive">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        {t('confirmPassword')}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showConfirmPw ? 'text' : 'password'}
                          placeholder={t('confirmPassword')}
                          className="pl-9 pr-9 text-xs"
                          {...register('confirmPassword')}
                        />
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                aria-label={showConfirmPw ? tAuth('hidePassword') : tAuth('showPassword')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              />
                            }
                          >
                            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </TooltipTrigger>
                          <TooltipContent>
                            {showConfirmPw ? tAuth('hidePassword') : tAuth('showPassword')}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-[11px] text-destructive">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || changePasswordMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium px-4 cursor-pointer"
                    >
                      {isSubmitting || changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          {tCommon('saving')}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          {t('savePassword')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

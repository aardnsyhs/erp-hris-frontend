'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

export default function ProfilePage() {
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
    return new Intl.DateTimeFormat('id-ID', {
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
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-0.5">
            HR Administrator
          </Badge>
        );
      case 'MANAGER':
        return (
          <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-0.5">
            Departemen Manager
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-800">
            Karyawan (Employee)
          </Badge>
        );
    }
  };

  const emp = user?.employee;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
            <User className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Profil Pengguna & Keamanan
          </h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Informasi akun terdaftar, data kepegawaian, dan pengaturan keamanan kata sandi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Ringkasan Akun */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md mb-3">
                {emp?.fullName
                  ? emp.fullName
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <CardTitle className="text-lg font-bold">
                {emp?.fullName || user?.email}
              </CardTitle>
              <CardDescription className="text-xs font-mono">
                {emp?.nip ? `NIP: ${emp.nip}` : user?.email}
              </CardDescription>
              <div className="pt-2 flex justify-center">{getRoleBadge(user?.role)}</div>
            </CardHeader>

            <CardContent className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  Email Login:
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {user?.email}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-neutral-400" />
                  Status Akun:
                </span>
                {user?.isActive ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px]">
                    Dinonaktifkan
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  Terdaftar Sejak:
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Rincian Kepegawaian & Ganti Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Data Profil Kepegawaian */}
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-blue-600" />
                Data Kepegawaian
              </CardTitle>
              <CardDescription className="text-xs">
                Informasi posisi, departemen, dan masa kerja yang terhubung dengan akun Anda.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="py-6 flex items-center justify-center text-xs text-neutral-400">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memuat data kepegawaian...
                </div>
              ) : emp ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-semibold text-neutral-400 block">
                      Nama Lengkap
                    </span>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                      {emp.fullName}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-semibold text-neutral-400 block">
                      Nomor Induk Pegawai (NIP)
                    </span>
                    <p className="font-mono font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                      {emp.nip}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-semibold text-neutral-400 block">
                      Departemen
                    </span>
                    <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>{emp.department?.name || '-'}</span>
                      {emp.department?.code && (
                        <span className="text-[10px] text-neutral-400 font-mono">
                          ({emp.department.code})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-semibold text-neutral-400 block">
                      Jabatan / Posisi
                    </span>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {emp.jobTitle}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-semibold text-neutral-400 block">
                      Nomor Telepon
                    </span>
                    <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{emp.phone || '-'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                    <span className="text-[11px] font-semibold text-neutral-400 block">
                      Tanggal Bergabung
                    </span>
                    <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{formatDate(emp.hireDate)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                  Akun ini tidak ditautkan langsung dengan profil karyawan tertentu (Akun Administrator Sistem).
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Form Ganti Password */}
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Ganti Kata Sandi (Password)
              </CardTitle>
              <CardDescription className="text-xs">
                Perbarui kata sandi secara berkala untuk menjaga keamanan akun Anda.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Kata Sandi Saat Ini
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      type={showCurrentPw ? 'text' : 'password'}
                      placeholder="Masukkan kata sandi saat ini"
                      className="pl-9 pr-9 text-xs"
                      {...register('currentPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-[11px] text-red-500">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Kata Sandi Baru (Min. 8 karakter)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        type={showNewPw ? 'text' : 'password'}
                        placeholder="Minimal 8 karakter"
                        className="pl-9 pr-9 text-xs"
                        {...register('newPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-[11px] text-red-500">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        type={showConfirmPw ? 'text' : 'password'}
                        placeholder="Ulangi kata sandi baru"
                        className="pl-9 pr-9 text-xs"
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-red-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || changePasswordMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4"
                  >
                    {isSubmitting || changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Simpan Kata Sandi
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
  );
}

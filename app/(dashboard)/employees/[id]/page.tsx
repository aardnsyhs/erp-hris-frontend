'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  User,
  Edit2,
  Clock,
  Briefcase,
  AlertCircle,
  RotateCcw,
  UserX,
  UserMinus,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEmployee } from '@/hooks/use-employees';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmployeeFormDialog } from '@/components/employees/employee-form-dialog';
import { EmployeeDeleteDialog } from '@/components/employees/employee-delete-dialog';
import { EmployeeReactivateDialog } from '@/components/employees/employee-reactivate-dialog';
import { EmployeeTerminateDialog } from '@/components/employees/employee-terminate-dialog';
import { cn } from '@/lib/utils';
import { Employee } from '@/types/employee';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isReactivateOpen, setIsReactivateOpen] = useState(false);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);

  const { data: employee, isLoading, isError, error } = useEmployee(id);

  // Format currency helper
  const formatCurrency = (val: string | number | undefined) => {
    if (!val) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  // Format date helper
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  // Format date time helper
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Calculate tenure
  const calculateTenure = (hireDateStr?: string) => {
    if (!hireDateStr) return '-';
    const hire = new Date(hireDateStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - hire.getFullYear()) * 12 + (now.getMonth() - hire.getMonth());
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    if (years === 0) {
      return `${months} bulan`;
    }
    return `${years} tahun ${months > 0 ? `${months} bulan` : ''}`;
  };

  // Handle 403 Forbidden Error State
  if (isError && (error as any)?.response?.status === 403) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 text-center p-6 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200">
              Akses Ditolak (403 Forbidden)
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300">
              Anda tidak memiliki izin untuk melihat profil karyawan ini. Anda hanya dapat melihat profil pribadi Anda sendiri atau anggota tim dalam departemen Anda.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: 'destructive' }))}
            >
              Ke Dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Handle 404 Not Found Error State
  if (isError && (error as any)?.response?.status === 404) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="text-center p-6 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Karyawan Tidak Ditemukan (404)
            </h2>
            <p className="text-sm text-neutral-500">
              Data karyawan dengan ID tersebut tidak ditemukan dalam sistem.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              href="/employees"
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Karyawan
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Loading State Skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!employee) return null;

  const isInactive = employee.status === 'INACTIVE';
  const isTerminated = employee.status === 'TERMINATED';
  const isActive = employee.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {employee.fullName}
              </h1>
              {isInactive ? (
                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300">
                  Nonaktif (INACTIVE)
                </Badge>
              ) : isTerminated ? (
                <Badge variant="destructive" className="bg-red-600">
                  Diberhentikan (TERMINATED)
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Aktif
                </Badge>
              )}
            </div>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              NIP: {employee.nip} • ID: {employee.id}
            </p>
          </div>
        </div>

        {isHrAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            {isInactive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReactivateOpen(true)}
                className="border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Aktifkan Kembali
              </Button>
            )}

            {isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeactivateOpen(true)}
                className="text-amber-700 dark:text-amber-400 border-amber-300 hover:bg-amber-50 text-xs"
              >
                <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                Nonaktifkan
              </Button>
            )}

            {!isTerminated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTerminateOpen(true)}
                className="text-red-600 dark:text-red-400 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
              >
                <UserX className="w-3.5 h-3.5 mr-1.5" />
                Berhentikan
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit Profil
            </Button>
          </div>
        )}
      </div>

      {/* Lifecycle Status Banner for Inactive & Terminated Employees */}
      {isInactive && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Karyawan Berstatus Nonaktif (INACTIVE)</AlertTitle>
          <AlertDescription>
            Karyawan ini telah dinonaktifkan sementara pada{' '}
            <span className="font-semibold">{formatDateTime(employee.deletedAt)}</span>. Akun pengguna terkait tidak dapat login ke sistem. Anda dapat memulihkan status keaktifannya dengan menekan tombol <strong>Aktifkan Kembali</strong>.
          </AlertDescription>
        </Alert>
      )}

      {isTerminated && (
        <Alert variant="destructive">
          <UserX className="h-4 w-4" />
          <AlertTitle>Karyawan Telah Diberhentikan Permanen (TERMINATED)</AlertTitle>
          <AlertDescription>
            Karyawan ini diberhentikan permanen pada{' '}
            <span className="font-semibold">{formatDateTime(employee.deletedAt)}</span>. Catatan riwayat tetap disimpan untuk kebutuhan audit kepatuhan, namun status ini <strong>tidak dapat diaktifkan kembali</strong> melalui sistem.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Informasi Kontak & Akun */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-blue-600">
              <User className="w-4 h-4" />
              <CardTitle className="text-base font-semibold">
                Informasi Pribadi & Kontak
              </CardTitle>
            </div>
            <CardDescription>
              Detail kontak dan akun login karyawan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500 text-xs">Nama Lengkap</span>
              <span className="col-span-2 font-medium text-neutral-900 dark:text-neutral-100">
                {employee.fullName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500 text-xs flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
              <span className="col-span-2 font-medium text-neutral-900 dark:text-neutral-100">
                {employee.email}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500 text-xs flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Telepon
              </span>
              <span className="col-span-2 font-medium text-neutral-900 dark:text-neutral-100">
                {employee.phone || '-'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <span className="text-neutral-500 text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Akun User
              </span>
              <div className="col-span-2 flex items-center gap-2">
                {employee.user ? (
                  <Badge variant="secondary" className="text-xs uppercase">
                    {employee.user.role}
                  </Badge>
                ) : (
                  <span className="text-xs text-neutral-400">Belum terhubung akun login</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Informasi Kepegawaian */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <Briefcase className="w-4 h-4" />
              <CardTitle className="text-base font-semibold">
                Penempatan & Jabatan
              </CardTitle>
            </div>
            <CardDescription>
              Struktur departemen dan masa kerja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500 text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Departemen
              </span>
              <span className="col-span-2 font-medium text-neutral-900 dark:text-neutral-100">
                {employee.department?.name || '-'}{' '}
                {employee.department?.code && (
                  <span className="text-xs text-neutral-400">
                    ({employee.department.code})
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500 text-xs">Jabatan</span>
              <span className="col-span-2 font-medium text-neutral-900 dark:text-neutral-100">
                {employee.jobTitle}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500 text-xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Mulai Bekerja
              </span>
              <span className="col-span-2 font-medium text-neutral-900 dark:text-neutral-100">
                {formatDate(employee.hireDate)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <span className="text-neutral-500 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Masa Kerja
              </span>
              <span className="col-span-2 font-medium text-neutral-900 dark:text-neutral-100">
                {calculateTenure(employee.hireDate)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Kompensasi & Gaji Pokok */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <CreditCard className="w-4 h-4" />
              <CardTitle className="text-base font-semibold">
                Kompensasi Finansial
              </CardTitle>
            </div>
            <CardDescription>
              Besaran gaji pokok dasar karyawan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {employee.baseSalary !== undefined ? (
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Gaji Pokok Bulanan (Base Salary)
                </span>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                  {formatCurrency(employee.baseSalary)}
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1">
                  Nilai ini menjadi dasar perhitungan slip gaji bulanan pada modul Payroll.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Informasi Gaji Dilindungi
                  </span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Data nominal gaji pokok bersifat rahasia dan hanya dapat diakses oleh HR Admin atau karyawan pemilik akun.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Metadata & Audit Trail */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
              Audit & Metadata Sistem
            </CardTitle>
            <CardDescription>
              Catatan riwayat pembuatan, perubahan, dan penonaktifan data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
              <span>Waktu Pembuatan (Created At):</span>
              <span className="font-mono text-neutral-900 dark:text-neutral-200">
                {formatDateTime(employee.createdAt)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
              <span>Terakhir Diperbarui:</span>
              <span className="font-mono text-neutral-900 dark:text-neutral-200">
                {formatDateTime(employee.updatedAt)}
              </span>
            </div>
            {employee.deletedAt && (
              <div className="flex justify-between py-1.5 text-red-600 dark:text-red-400 font-semibold">
                <span>Waktu Dinonaktifkan (deletedAt):</span>
                <span className="font-mono">{formatDateTime(employee.deletedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EmployeeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        employeeToEdit={employee}
      />

      {/* Deactivate Dialog */}
      {employee && (
        <EmployeeDeleteDialog
          open={isDeactivateOpen}
          onOpenChange={setIsDeactivateOpen}
          employee={employee}
        />
      )}

      {/* Reactivate Dialog */}
      {employee && (
        <EmployeeReactivateDialog
          open={isReactivateOpen}
          onOpenChange={setIsReactivateOpen}
          employee={employee}
        />
      )}

      {/* Terminate Dialog */}
      {employee && (
        <EmployeeTerminateDialog
          open={isTerminateOpen}
          onOpenChange={setIsTerminateOpen}
          employee={employee}
        />
      )}
    </div>
  );
}

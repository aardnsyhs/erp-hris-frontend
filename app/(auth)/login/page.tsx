'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Lock, Mail, Loader2, KeyRound } from 'lucide-react';
import { apiClient } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/auth-store';
import { LoginResponse } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const demoAccounts = [
  {
    role: 'HR_ADMIN',
    email: 'admin.hr@example.com',
    name: 'Budi Santoso (HR Admin)',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    role: 'MANAGER',
    email: 'manager.eng@example.com',
    name: 'Hendra Pratama (Eng Manager)',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  {
    role: 'EMPLOYEE',
    email: 'dev.andi@example.com',
    name: 'Andi Wijaya (Senior Dev)',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Silakan lengkapi email dan password');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      const { user, accessToken } = response.data;
      setAuth(user, accessToken);

      toast.success(`Selamat datang, ${user.employee?.fullName || user.email}!`);
      router.push('/');
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setErrorMessage('Terlalu banyak percobaan login. Silakan tunggu 1 menit.');
        toast.error('Batas percobaan login terlampaui (Rate limit 429)');
      } else if (err?.response?.status === 401) {
        setErrorMessage('Email atau password salah / Akun dinonaktifkan.');
        toast.error('Kredensial tidak valid');
      } else {
        setErrorMessage('Terjadi kesalahan jaringan saat login. Pastikan server aktif.');
        toast.error('Gagal terhubung ke server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-br from-neutral-100 via-neutral-50 to-blue-50/40 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/20">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <BriefcaseBusiness className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            HRIS & ERP Portal
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Masuk untuk mengakses sistem manajemen kepegawaian
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-lg bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold">Autentikasi Akun</CardTitle>
            <CardDescription>Masukkan email dan kata sandi terdaftar Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-xs font-medium text-red-700 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    type="email"
                    placeholder="nama@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk ke Sistem'
                )}
              </Button>
            </form>

            {/* Quick-Fill Demo Accounts Helper */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Akun Uji Coba Cepat (Password: password123):</span>
              </div>
              <div className="space-y-1.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemoAccount(acc.email)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors flex items-center justify-between text-xs"
                  >
                    <span className="text-neutral-700 dark:text-neutral-300 truncate font-medium">
                      {acc.name}
                    </span>
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0 ${acc.color}`}>
                      {acc.role}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

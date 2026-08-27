'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import { apiClient } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/auth-store';
import { LoginResponse } from '@/types/auth';
import { getSafeRedirectPath } from '@/lib/utils/redirect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { toast } from 'sonner';

const demoAccounts = [
  {
    role: 'HR_ADMIN',
    email: 'admin.hr@example.com',
    name: 'Budi Santoso (HR Admin)',
  },
  {
    role: 'MANAGER',
    email: 'manager.eng@example.com',
    name: 'Hendra Pratama (Eng Manager)',
  },
  {
    role: 'EMPLOYEE',
    email: 'dev.andi@example.com',
    name: 'Andi Wijaya (Senior Dev)',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);

  const rawRedirect = searchParams.get('redirect');
  const redirectTo = getSafeRedirectPath(rawRedirect);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoadingAuth, router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage(t('invalidCredentials'));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    let loginData: LoginResponse | null = null;

    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      if (!response?.data?.accessToken || !response?.data?.user) {
        const internalErr = 'Respons server tidak valid. Silakan coba beberapa saat lagi.';
        setErrorMessage(internalErr);
        toast.error(internalErr);
        setIsLoading(false);
        return;
      }

      loginData = response.data;
    } catch (err: any) {
      if (err?.response?.status === 429) {
        const msg = 'Terlalu banyak percobaan login. Silakan tunggu 1 menit.';
        setErrorMessage(msg);
        toast.error(msg);
      } else if (err?.response?.status === 401) {
        const rawMessage =
          err?.response?.data?.message || t('invalidCredentials');
        const displayMsg = Array.isArray(rawMessage)
          ? rawMessage.join(', ')
          : rawMessage;
        setErrorMessage(displayMsg);
        toast.error(displayMsg);
      } else if (err?.response?.status === 400) {
        const rawMessage =
          err?.response?.data?.message || 'Validasi login gagal';
        const displayMsg = Array.isArray(rawMessage)
          ? rawMessage.join(', ')
          : rawMessage;
        setErrorMessage(displayMsg);
        toast.error(displayMsg);
      } else if (!err?.response) {
        const networkMsg = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
        setErrorMessage(networkMsg);
        toast.error(networkMsg);
      } else {
        const serverMsg =
          err?.response?.data?.message || 'Terjadi kesalahan sistem pada server.';
        const displayMsg = Array.isArray(serverMsg)
          ? serverMsg.join(', ')
          : serverMsg;
        setErrorMessage(displayMsg);
        toast.error(displayMsg);
      }
      setIsLoading(false);
      return;
    }

    try {
      setAuth(loginData.user, loginData.accessToken);
      toast.success(t('loginSuccess'));
      router.replace(redirectTo);
      router.refresh();
    } catch (clientErr) {
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono font-bold text-xs shadow-xs tracking-wider">
            HR
          </div>
          <span className="font-bold text-xs tracking-wider uppercase font-mono text-foreground">
            HRIS & ERP Console
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-5">
          {/* Card Form */}
          <div className="rounded-md border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {t('loginTitle')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('loginSubtitle')}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-md border border-(--status-danger)/30 bg-status-danger-bg text-xs text-status-danger font-mono">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('emailLabel')}
                </label>
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs bg-card font-mono h-9 rounded-md border-border"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-9 text-xs bg-card font-mono h-9 rounded-md border-border"
                    required
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                          />
                        }
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {showPassword ? t('hidePassword') : t('showPassword')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold h-9 rounded-md cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    {t('loggingIn')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </form>

            {/* Quick Demo Credentials Console Strip */}
            <div className="pt-3 border-t border-border/70 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block text-center sm:text-left">
                Preset Demo Operators:
              </span>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillDemoAccount(acc.email)}
                    className="p-1.5 rounded border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors truncate text-center cursor-pointer"
                    title={acc.name}
                  >
                    {acc.role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-center text-[11px] text-muted-foreground font-mono flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>{t('securityNotice')}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

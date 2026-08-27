'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BriefcaseBusiness,
  Lock,
  Mail,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { apiClient } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/auth-store';
import { LoginResponse } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    color: 'bg-primary/10 text-primary',
  },
  {
    role: 'MANAGER',
    email: 'manager.eng@example.com',
    name: 'Hendra Pratama (Eng Manager)',
    color: 'bg-secondary text-secondary-foreground',
  },
  {
    role: 'EMPLOYEE',
    email: 'dev.andi@example.com',
    name: 'Andi Wijaya (Senior Dev)',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage(t('invalidCredentials'));
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

      toast.success(t('loginSuccess'));
      router.push('/');
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setErrorMessage(
          'Terlalu banyak percobaan login. Silakan tunggu 1 menit.',
        );
        toast.error('Batas percobaan login terlampaui (Rate limit 429)');
      } else if (err?.response?.status === 401) {
        const rawMessage =
          err?.response?.data?.message || t('invalidCredentials');
        const displayMsg = Array.isArray(rawMessage)
          ? rawMessage.join(', ')
          : rawMessage;
        setErrorMessage(displayMsg);
        toast.error(displayMsg);
      } else {
        const rawMessage =
          err?.response?.data?.message || t('loginFailed');
        const displayMsg = Array.isArray(rawMessage)
          ? rawMessage.join(', ')
          : rawMessage;
        setErrorMessage(displayMsg);
        toast.error(displayMsg);
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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-background text-foreground relative transition-colors">
      {/* Top Right Utilities: Language & Theme */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md font-bold">
            <BriefcaseBusiness className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('loginTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg bg-card/90 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold">{t('loginTitle')}</CardTitle>
            <CardDescription>{t('loginSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs font-medium text-destructive">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {t('emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          />
                        }
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </TooltipTrigger>
                      <TooltipContent>
                        {showPassword ? t('hidePassword') : t('showPassword')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('loggingIn')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </form>

            {/* Quick-Fill Demo Accounts Helper */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-muted-foreground">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Akun Uji Coba Cepat (Password: password123):</span>
              </div>
              <div className="space-y-1.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemoAccount(acc.email)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="text-foreground truncate font-medium">
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

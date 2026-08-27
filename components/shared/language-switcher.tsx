'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const t = useTranslations('language');

  const switchLanguage = (newLocale: 'id' | 'en') => {
    if (newLocale === currentLocale) return;

    // Set NEXT_LOCALE cookie with 1 year expiration
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;

    // Refresh server components to re-read cookie and load new messages
    router.refresh();
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('switchLanguage')}
                  className="flex items-center gap-1.5 h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                />
              }
            />
          }
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="uppercase font-mono font-semibold text-[11px]">
            {currentLocale}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{t('switchLanguage')}</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => switchLanguage('id')}
          className="flex items-center justify-between text-xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold font-mono text-muted-foreground">ID</span>
            <span>{t('id')}</span>
          </div>
          {currentLocale === 'id' && <span className="text-primary font-bold">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => switchLanguage('en')}
          className="flex items-center justify-between text-xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold font-mono text-muted-foreground">EN</span>
            <span>{t('en')}</span>
          </div>
          {currentLocale === 'en' && <span className="text-primary font-bold">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

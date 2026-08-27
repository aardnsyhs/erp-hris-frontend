'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Moon, Sun, Monitor } from 'lucide-react';
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

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('theme');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t('toggleTheme')}
                  className="relative text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                />
              }
            />
          }
        >
          {mounted ? (
            theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : theme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )
          ) : (
            <Sun className="h-4 w-4 opacity-0" />
          )}
          <span className="sr-only">{t('toggleTheme')}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{t('toggleTheme')}</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <Sun className="h-3.5 w-3.5" />
          <span>{t('light')}</span>
          {mounted && theme === 'light' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <Moon className="h-3.5 w-3.5" />
          <span>{t('dark')}</span>
          {mounted && theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <Monitor className="h-3.5 w-3.5" />
          <span>{t('system')}</span>
          {mounted && theme === 'system' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

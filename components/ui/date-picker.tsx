'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  RotateCcw,
  X,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function formatToYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseFromYMD(str?: string | null): Date | undefined {
  if (!str) return undefined;
  const parts = str.split('-');
  if (parts.length !== 3) return undefined;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  return new Date(year, month - 1, day);
}

export function formatIndonesianDate(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (dateStr: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  className?: string;
  allowClear?: boolean;
  ariaLabel?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  disabled = false,
  disabledDates,
  className,
  allowClear = false,
  ariaLabel = 'Pilih tanggal',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseFromYMD(value);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(formatToYMD(date));
      setOpen(false);
    } else {
      onChange?.('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-expanded={open}
            className={cn(
              'w-full justify-start text-left font-normal text-xs h-8.5 bg-card border-border px-2.5 font-mono cursor-pointer rounded-md',
              !selectedDate && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate flex-1">
          {selectedDate ? formatIndonesianDate(selectedDate) : placeholder}
        </span>
        {allowClear && selectedDate && !disabled && (
          <span
            onClick={handleClear}
            role="button"
            tabIndex={0}
            aria-label="Hapus tanggal"
            className="ml-1 p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-2 bg-popover rounded-md shadow-lg border border-border max-w-[calc(100vw-1rem)]"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  from?: string; // YYYY-MM-DD (applied start date)
  to?: string; // YYYY-MM-DD (applied end date)
  onChange?: (range: { from: string; to: string }) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  className?: string;
  allowClear?: boolean;
  ariaLabel?: string;
  applyMode?: 'manual' | 'auto';
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder = 'Rentang Tanggal',
  disabled = false,
  disabledDates,
  className,
  allowClear = false,
  ariaLabel = 'Pilih rentang tanggal',
  applyMode = 'manual',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(() => {
    const initFrom = parseFromYMD(from);
    const initTo = parseFromYMD(to);
    return initFrom || initTo ? { from: initFrom, to: initTo } : undefined;
  });
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  // Sync draft with applied props whenever applied props change or popover opens
  useEffect(() => {
    const initFrom = parseFromYMD(from);
    const initTo = parseFromYMD(to);
    setDraftRange(initFrom || initTo ? { from: initFrom, to: initTo } : undefined);
    setIsSelectingEnd(false);
  }, [from, to, open]);

  // Handle day click inside calendar
  const handleDayClick = (clickedDate: Date) => {
    if (!isSelectingEnd || !draftRange?.from) {
      // Step 1: User picks start date
      setDraftRange({ from: clickedDate, to: undefined });
      setIsSelectingEnd(true);
      // Do NOT trigger onChange, popover stays open
    } else {
      // Step 2: User picks end date
      const fromDate = draftRange.from <= clickedDate ? draftRange.from : clickedDate;
      const toDate = draftRange.from <= clickedDate ? clickedDate : draftRange.from;

      setDraftRange({ from: fromDate, to: toDate });
      setIsSelectingEnd(false);

      if (applyMode === 'auto') {
        onChange?.({
          from: formatToYMD(fromDate),
          to: formatToYMD(toDate),
        });
        setOpen(false);
      }
      // In manual mode (default), draft is updated and user clicks "Terapkan"
    }
  };

  const handleApply = () => {
    if (!draftRange?.from || !draftRange?.to) return;
    const fromDate = draftRange.from <= draftRange.to ? draftRange.from : draftRange.to;
    const toDate = draftRange.from <= draftRange.to ? draftRange.to : draftRange.from;

    onChange?.({
      from: formatToYMD(fromDate),
      to: formatToYMD(toDate),
    });
    setIsSelectingEnd(false);
    setOpen(false);
  };

  const handleCancel = () => {
    const initFrom = parseFromYMD(from);
    const initTo = parseFromYMD(to);
    setDraftRange(initFrom || initTo ? { from: initFrom, to: initTo } : undefined);
    setIsSelectingEnd(false);
    setOpen(false);
  };

  const handleReset = () => {
    setDraftRange(undefined);
    setIsSelectingEnd(false);
    onChange?.({ from: '', to: '' });
    setOpen(false);
  };

  const handleClearTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftRange(undefined);
    setIsSelectingEnd(false);
    onChange?.({ from: '', to: '' });
  };

  // Trigger displays ONLY applied range from props
  const displayText = (() => {
    if (from && to) {
      const fromDate = parseFromYMD(from);
      const toDate = parseFromYMD(to);
      if (fromDate && toDate) {
        return `${formatIndonesianDate(fromDate)} – ${formatIndonesianDate(toDate)}`;
      }
    }
    return placeholder;
  })();

  const isRangeComplete = !!(draftRange?.from && draftRange?.to);
  const hasAppliedValue = !!(from && to);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          // Revert draft to applied range on close
          const initFrom = parseFromYMD(from);
          const initTo = parseFromYMD(to);
          setDraftRange(initFrom || initTo ? { from: initFrom, to: initTo } : undefined);
          setIsSelectingEnd(false);
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-expanded={open}
            className={cn(
              'w-full justify-start text-left font-normal text-xs h-8.5 bg-card border-border px-2.5 font-mono cursor-pointer rounded-md',
              !from && !to && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate flex-1">{displayText}</span>
        {allowClear && hasAppliedValue && !disabled && (
          <span
            onClick={handleClearTrigger}
            role="button"
            tabIndex={0}
            aria-label="Hapus rentang tanggal"
            className="ml-1 p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[calc(100vw-1rem)] sm:w-[340px] max-w-[calc(100vw-1rem)] p-0 bg-popover rounded-md shadow-xl border border-border overflow-hidden"
      >
        {/* Structured Header with Mulai / Selesai Cards */}
        <div className="space-y-2 border-b border-border px-4 py-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground font-mono">
              Pilih rentang tanggal
            </p>
            <span className="text-[10px] text-muted-foreground font-medium font-mono">
              {isSelectingEnd && draftRange?.from
                ? 'Langkah 2: Pilih tanggal akhir'
                : isRangeComplete
                ? 'Rentang dipilih'
                : 'Langkah 1: Pilih tanggal mulai'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="rounded-md bg-card px-2.5 py-1.5 border border-border shadow-2xs">
              <span className="block text-[10px] text-muted-foreground uppercase">Mulai</span>
              <span className="font-semibold text-foreground text-xs truncate block tabular-nums">
                {draftRange?.from ? formatIndonesianDate(draftRange.from) : 'Belum dipilih'}
              </span>
            </div>

            <div className="rounded-md bg-card px-2.5 py-1.5 border border-border shadow-2xs">
              <span className="block text-[10px] text-muted-foreground uppercase">Selesai</span>
              <span className="font-semibold text-foreground text-xs truncate block tabular-nums">
                {draftRange?.to ? formatIndonesianDate(draftRange.to) : 'Belum dipilih'}
              </span>
            </div>
          </div>
        </div>

        {/* Calendar in Padded Container */}
        <div className="px-3 py-2 flex justify-center">
          <Calendar
            mode="range"
            selected={
              draftRange?.from
                ? {
                    from: draftRange.from,
                    to: draftRange.to,
                  }
                : undefined
            }
            onDayClick={handleDayClick}
            disabled={disabledDates}
          />
        </div>

        {/* Structured Footer Actions */}
        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!hasAppliedValue && !draftRange?.from}
            className="text-xs min-h-8 px-2.5 text-muted-foreground hover:text-foreground font-mono cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-xs min-h-8 px-3 font-mono cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isRangeComplete}
              onClick={handleApply}
              className="text-xs min-h-8 px-3.5 bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold font-mono cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Terapkan
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

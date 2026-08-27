'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown, Loader2, Search, User } from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface EmployeeComboboxProps {
  value: string;
  onChange: (employeeId: string, employee?: Employee) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function EmployeeCombobox({
  value,
  onChange,
  disabled = false,
  placeholder,
}: EmployeeComboboxProps) {
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const resolvedPlaceholder = placeholder || t('searchPlaceholder');

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search term 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setHighlightedIndex(-1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: employeesData, isLoading } = useEmployees({
    search: debouncedSearch || undefined,
    limit: 25,
    page: 1,
  });

  const activeEmployees = (employeesData?.data || []).filter(
    (emp) => !emp.deletedAt && emp.status === 'ACTIVE',
  );

  // Fetch or find currently selected employee
  const selectedEmployee = activeEmployees.find((emp) => emp.id === value);
  const [cachedEmployee, setCachedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (selectedEmployee) {
      setCachedEmployee(selectedEmployee);
    }
  }, [selectedEmployee]);

  const displayEmployee = selectedEmployee || cachedEmployee;

  const handleSelect = (emp: Employee) => {
    setCachedEmployee(emp);
    onChange(emp.id, emp);
    setOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < activeEmployees.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : activeEmployees.length - 1,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < activeEmployees.length) {
        handleSelect(activeEmployees[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={resolvedPlaceholder}
            disabled={disabled}
            className="w-full justify-between font-normal text-xs h-9 bg-card text-foreground px-3 cursor-pointer"
          />
        }
      >
        <span className="truncate">
          {displayEmployee && displayEmployee.id === value ? (
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>{displayEmployee.fullName}</span>
              <span className="font-mono text-muted-foreground text-[11px]">
                ({displayEmployee.nip})
              </span>
              {displayEmployee.department?.name && (
                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded ml-1 truncate">
                  {displayEmployee.department.name}
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{resolvedPlaceholder}</span>
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-[--anchor-width] p-2 bg-popover shadow-lg rounded-xl border border-border" align="start">
        {/* Search input header */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8 h-8 text-xs bg-muted border-border"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Results List */}
        <div className="max-h-56 overflow-y-auto space-y-0.5 text-xs">
          {isLoading && activeEmployees.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{tCommon('loading')}</span>
            </div>
          ) : activeEmployees.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              {t('noEmployeesFound')}
            </div>
          ) : (
            activeEmployees.map((emp, idx) => {
              const isSelected = emp.id === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleSelect(emp)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    'w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : isHighlighted
                      ? 'bg-muted text-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium truncate">{emp.fullName}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        ({emp.nip})
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {emp.jobTitle} • {emp.department?.name || '-'}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary shrink-0 ml-1" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

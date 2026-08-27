'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  placeholder = 'Cari dan pilih karyawan...',
}: EmployeeComboboxProps) {
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

  // If value is set but not in current search list, fetch all or retain
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
            aria-label="Pilih karyawan penerima gaji"
            disabled={disabled}
            className="w-full justify-between font-normal text-xs h-9 bg-white dark:bg-neutral-900 px-3"
          />
        }
      >
        <span className="truncate">
          {displayEmployee && displayEmployee.id === value ? (
            <span className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 font-medium">
              <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{displayEmployee.fullName}</span>
              <span className="font-mono text-neutral-400 text-[11px]">
                ({displayEmployee.nip})
              </span>
              {displayEmployee.department?.name && (
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded ml-1 truncate">
                  {displayEmployee.department.name}
                </span>
              )}
            </span>
          ) : (
            <span className="text-neutral-400">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-[--anchor-width] p-2 bg-popover shadow-lg rounded-xl border border-neutral-200 dark:border-neutral-800" align="start">
        {/* Search input header */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <Input
            ref={inputRef}
            placeholder="Cari nama atau NIP karyawan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8 h-8 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-neutral-400" />
          )}
        </div>

        {/* Results List */}
        <div className="max-h-56 overflow-y-auto space-y-0.5 text-xs">
          {isLoading && activeEmployees.length === 0 ? (
            <div className="py-4 text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Mencari karyawan...</span>
            </div>
          ) : activeEmployees.length === 0 ? (
            <div className="py-4 text-center text-xs text-neutral-400">
              Karyawan tidak ditemukan
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
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-medium'
                      : isHighlighted
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium truncate">{emp.fullName}</span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        ({emp.nip})
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {emp.jobTitle} • {emp.department?.name || 'Tanpa Departemen'}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
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

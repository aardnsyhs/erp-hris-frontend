'use client';

import React from 'react';
import { Table } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalRows?: number;
}

export function DataTablePagination<TData>({
  table,
  totalRows,
}: DataTablePaginationProps<TData>) {
  const t = useTranslations('common');
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  const total = totalRows ?? table.getFilteredRowModel().rows.length;
  const startRow = total === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-1.5 px-0.5 text-xs text-muted-foreground font-mono">
      <div className="flex items-center gap-1.5 text-xs">
        <span>{t('showing', { count: total })}</span>
        <span className="font-semibold text-foreground tabular-nums">
          [{startRow}–{endRow} {t('of')} {total}]
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{t('rowsPerPage')}:</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-7.5 w-[65px] text-xs font-mono rounded-md border-border bg-card">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs font-mono">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-1">
            <span className="text-xs mr-2 text-foreground font-semibold tabular-nums">
              {pageIndex + 1} / {Math.max(pageCount, 1)}
            </span>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-xs"
                    className="h-7.5 w-7.5 rounded-md border-border bg-card cursor-pointer"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    aria-label={t('firstPage')}
                  />
                }
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent>{t('firstPage')}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-xs"
                    className="h-7.5 w-7.5 rounded-md border-border bg-card cursor-pointer"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label={t('previousPage')}
                  />
                }
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent>{t('previousPage')}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-xs"
                    className="h-7.5 w-7.5 rounded-md border-border bg-card cursor-pointer"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label={t('nextPage')}
                  />
                }
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent>{t('nextPage')}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-xs"
                    className="h-7.5 w-7.5 rounded-md border-border bg-card cursor-pointer"
                    onClick={() => table.setPageIndex(pageCount - 1)}
                    disabled={!table.getCanNextPage()}
                    aria-label={t('lastPage')}
                  />
                }
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent>{t('lastPage')}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

import React from 'react';
import { Table } from '@tanstack/react-table';
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
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  const total = totalRows ?? table.getFilteredRowModel().rows.length;
  const startRow = total === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1 text-sm text-neutral-500 dark:text-neutral-400">
      <div className="flex items-center gap-1">
        <span>Menampilkan</span>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {startRow}-{endRow}
        </span>
        <span>dari</span>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {total}
        </span>
        <span>data</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm">Baris per halaman:</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm mr-2">
              Halaman {pageIndex + 1} dari {Math.max(pageCount, 1)}
            </span>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Halaman pertama"
                  />
                }
              >
                <ChevronsLeft className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Halaman pertama</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Halaman sebelumnya"
                  />
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Halaman sebelumnya</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Halaman berikutnya"
                  />
                }
              >
                <ChevronRight className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Halaman berikutnya</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.setPageIndex(pageCount - 1)}
                    disabled={!table.getCanNextPage()}
                    aria-label="Halaman terakhir"
                  />
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Halaman terakhir</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

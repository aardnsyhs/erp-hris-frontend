'use client';

import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from './data-table-pagination';
import { DataTableSkeleton } from './data-table-skeleton';
import { EmptyState } from './empty-state';
import { Search } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  totalRows?: number;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  searchKey?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  totalRows,
  pageCount,
  pagination,
  onPaginationChange,
  searchKey,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  actions,
  emptyTitle = 'Tidak ada data',
  emptyDescription = 'Belum ada data yang tersimpan untuk kriteria ini.',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [clientSearch, setClientSearch] = React.useState('');

  const isServerPagination = pagination !== undefined && onPaginationChange !== undefined;

  const table = useReactTable({
    data,
    columns,
    pageCount: isServerPagination ? (pageCount ?? -1) : undefined,
    state: {
      sorting,
      pagination: isServerPagination ? pagination : undefined,
      globalFilter: searchKey ? undefined : (searchValue ?? clientSearch),
    },
    onSortingChange: setSorting,
    onPaginationChange: isServerPagination ? onPaginationChange : undefined,
    manualPagination: isServerPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(val);
    } else if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(val);
    } else {
      setClientSearch(val);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {(searchKey || onSearchChange) && (
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? (searchKey ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? '' : clientSearch)}
              onChange={handleSearchInput}
              className="pl-9 bg-white dark:bg-neutral-900"
            />
          </div>
        )}
        {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
      </div>

      {/* Table Content */}
      {isLoading ? (
        <DataTableSkeleton columnCount={columns.length} rowCount={pagination?.pageSize ?? 5} />
      ) : (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-neutral-50 dark:bg-neutral-800/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-11 font-semibold text-neutral-700 dark:text-neutral-300">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 text-neutral-800 dark:text-neutral-200">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center p-0"
                  >
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      className="border-0 rounded-none bg-transparent"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && (totalRows === undefined || totalRows > 0) && (
        <DataTablePagination table={table} totalRows={totalRows} />
      )}
    </div>
  );
}

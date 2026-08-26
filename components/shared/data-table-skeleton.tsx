import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export function DataTableSkeleton({
  columnCount = 5,
  rowCount = 5,
}: DataTableSkeletonProps) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-neutral-50 dark:bg-neutral-800/50">
          <TableRow>
            {Array.from({ length: columnCount }).map((_, index) => (
              <TableHead key={index} className="h-11">
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="h-14">
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

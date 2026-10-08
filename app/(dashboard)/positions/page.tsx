'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  Briefcase,
  Plus,
  Edit2,
  Search,
  CheckCircle2,
  XCircle,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { usePositions } from '@/hooks/use-positions';
import { Position } from '@/types/position';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PositionFormDialog } from '@/components/positions/position-form-dialog';

export default function PositionsPage() {
  const t = useTranslations('positions');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  const locale = useLocale();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [positionToEdit, setPositionToEdit] = useState<Position | null>(null);

  const { data: positions = [], isLoading } = usePositions({
    search: search.trim() || undefined,
  });

  const handleCreateClick = () => {
    setPositionToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (pos: Position) => {
    setPositionToEdit(pos);
    setIsFormOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const columns: ColumnDef<Position>[] = [
    {
      accessorKey: 'code',
      header: t('code'),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-muted text-foreground border border-border">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: t('positionTitle'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {row.original.title}
          </span>
          {row.original.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'level',
      header: t('level'),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono font-medium gap-1">
          <Layers className="h-3 w-3 text-muted-foreground" />
          {t('levelValue', { level: row.original.level })}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: t('status'),
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: t('createdAt'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        if (!isHrAdmin) return null;
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(row.original)}
              className="h-8 px-2 gap-1 text-xs"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {tCommon('edit')}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        badge={
          positions.length > 0 ? (
            <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
              {t('count', { count: positions.length })}
            </Badge>
          ) : undefined
        }
        actions={
          isHrAdmin ? (
            <Button
              onClick={handleCreateClick}
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs shrink-0 cursor-pointer font-medium text-xs h-8.5 rounded-md"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t('addPosition')}
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={positions}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(val) => setSearch(val)}
        searchPlaceholder={t('searchPlaceholder')}
      />

      {isHrAdmin && (
        <PositionFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          positionToEdit={positionToEdit}
        />
      )}
    </div>
  );
}

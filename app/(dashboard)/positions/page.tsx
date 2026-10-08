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
        <Badge
          variant={row.original.isActive ? 'default' : 'secondary'}
          className="gap-1 text-xs"
        >
          {row.original.isActive ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              {tCommon('active')}
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 text-muted-foreground" />
              {tCommon('inactive')}
            </>
          )}
        </Badge>
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
    <div className="space-y-6">
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
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('addPosition')}
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={positions}
        isLoading={isLoading}
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

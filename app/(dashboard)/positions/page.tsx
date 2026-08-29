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
      header: 'Kode Posisi',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-muted text-foreground border border-border">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Nama Posisi / Jabatan',
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
      header: 'Level',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono font-medium gap-1">
          <Layers className="h-3 w-3 text-muted-foreground" />
          Level {row.original.level}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? 'default' : 'secondary'}
          className="gap-1 text-xs"
        >
          {row.original.isActive ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Aktif
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 text-muted-foreground" />
              Non-Aktif
            </>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Dibuat Pada',
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
              Edit
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Jabatan & Posisi"
        description="Kelola hierarki level jabatan dan katalog posisi seluruh organisasi."
        badge={
          positions.length > 0 ? (
            <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
              {positions.length} Posisi
            </Badge>
          ) : undefined
        }
        actions={
          isHrAdmin ? (
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Posisi
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode atau nama posisi..."
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

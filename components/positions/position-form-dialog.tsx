'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Position } from '@/types/position';
import { useCreatePosition, useUpdatePosition } from '@/hooks/use-positions';
import { toast } from 'sonner';

interface PositionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positionToEdit?: Position | null;
}

export function PositionFormDialog({
  open,
  onOpenChange,
  positionToEdit,
}: PositionFormDialogProps) {
  const t = useTranslations('positions');
  const tCommon = useTranslations('common');

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();

  const isEditing = !!positionToEdit;
  const isPending = createPosition.isPending || updatePosition.isPending;

  useEffect(() => {
    if (positionToEdit) {
      setCode(positionToEdit.code);
      setTitle(positionToEdit.title);
      setDescription(positionToEdit.description || '');
      setLevel(positionToEdit.level);
      setIsActive(positionToEdit.isActive);
    } else {
      setCode('');
      setTitle('');
      setDescription('');
      setLevel(1);
      setIsActive(true);
    }
  }, [positionToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !title.trim()) {
      toast.error('Kode dan nama posisi wajib diisi');
      return;
    }

    if (level < 1) {
      toast.error('Level posisi minimal 1');
      return;
    }

    try {
      if (isEditing) {
        await updatePosition.mutateAsync({
          id: positionToEdit.id,
          payload: {
            code: code.trim().toUpperCase(),
            title: title.trim(),
            description: description.trim() || undefined,
            level: Number(level),
            isActive,
          },
        });
        toast.success('Posisi berhasil diperbarui');
      } else {
        await createPosition.mutateAsync({
          code: code.trim().toUpperCase(),
          title: title.trim(),
          description: description.trim() || undefined,
          level: Number(level),
          isActive,
        });
        toast.success('Posisi baru berhasil ditambahkan');
      }
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Gagal menyimpan posisi';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Master Posisi' : 'Tambah Master Posisi'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Perbarui informasi jabatan/posisi di bawah ini.'
                : 'Lengkapi data jabatan/posisi baru untuk organisasi.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <label htmlFor="pos-code" className="text-xs font-medium text-foreground">
                Kode Posisi <span className="text-destructive">*</span>
              </label>
              <Input
                id="pos-code"
                placeholder="e.g. ENG-SR, HR-MGR, FIN-ACC"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isPending}
                className="font-mono uppercase"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="pos-title" className="text-xs font-medium text-foreground">
                Nama / Judul Posisi <span className="text-destructive">*</span>
              </label>
              <Input
                id="pos-title"
                placeholder="e.g. Senior Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="pos-level" className="text-xs font-medium text-foreground">
                  Tingkat / Level <span className="text-destructive">*</span>
                </label>
                <Input
                  id="pos-level"
                  type="number"
                  min={1}
                  max={20}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  disabled={isPending}
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  (1: Entry, 2: Junior, 3: Mid, dst)
                </span>
              </div>

              <div className="flex flex-col justify-start gap-2 pt-1">
                <label htmlFor="pos-active" className="text-xs font-medium text-foreground">
                  Status Keaktifan
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="pos-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isPending}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>{isActive ? 'Aktif Digunakan' : 'Non-Aktif'}</span>
                </label>
              </div>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="pos-desc" className="text-xs font-medium text-foreground">
                Deskripsi / Keterangan
              </label>
              <Textarea
                id="pos-desc"
                placeholder="Deskripsi tugas dan ruang lingkup jabatan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Menyimpan...'
                : isEditing
                ? 'Simpan Perubahan'
                : 'Tambah Posisi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

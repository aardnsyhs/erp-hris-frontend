'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Phone,
  Mail,
  User,
  Plus,
  Edit2,
  Trash2,
  Star,
  ShieldAlert,
  HeartHandshake,
} from 'lucide-react';
import {
  useCreateEmergencyContact,
  useDeleteEmergencyContact,
  useEmergencyContacts,
  useUpdateEmergencyContact,
} from '@/hooks/use-emergency-contacts';
import { EmergencyContact } from '@/types/emergency-contact';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface EmergencyContactsTabProps {
  employeeId: string;
  isHrAdmin: boolean;
  isSelf: boolean;
}

export function EmergencyContactsTab({
  employeeId,
  isHrAdmin,
  isSelf,
}: EmergencyContactsTabProps) {
  const t = useTranslations('emergencyContacts');
  const tCommon = useTranslations('common');
  const tDialogs = useTranslations('dialogs');

  const canManage = isHrAdmin || isSelf;

  const { data: contacts = [], isLoading } = useEmergencyContacts(employeeId);
  const createMutation = useCreateEmergencyContact(employeeId);
  const updateMutation = useUpdateEmergencyContact(employeeId);
  const deleteMutation = useDeleteEmergencyContact(employeeId);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(
    null,
  );
  const [deletingContactId, setDeletingContactId] = useState<string | null>(
    null,
  );

  // Form Field States
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddDialog = () => {
    setEditingContact(null);
    setName('');
    setRelationship('');
    setPhone('');
    setEmail('');
    setIsPrimary(contacts.length === 0);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setEmail(contact.email || '');
    setIsPrimary(contact.isPrimary);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !relationship.trim() || !phone.trim()) {
      setFormError('Nama, hubungan, dan nomor telepon wajib diisi');
      return;
    }

    try {
      if (editingContact) {
        await updateMutation.mutateAsync({
          id: editingContact.id,
          input: {
            name: name.trim(),
            relationship: relationship.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            isPrimary,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          relationship: relationship.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          isPrimary,
        });
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || 'Gagal menyimpan kontak darurat',
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingContactId) return;
    try {
      await deleteMutation.mutateAsync(deletingContactId);
      setDeletingContactId(null);
    } catch {
      // error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Skeleton className="h-36 w-full rounded-lg bg-muted" />
        <Skeleton className="h-36 w-full rounded-lg bg-muted" />
      </div>
    );
  }

  const isMaxReached = contacts.length >= 3;

  return (
    <div className="space-y-4 pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-card border border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{t('title')}</h3>
            <Badge variant="outline" className="font-mono text-[10px]">
              {contacts.length} / 3
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('subtitle')}
          </p>
        </div>

        {canManage && (
          <Button
            size="sm"
            onClick={openAddDialog}
            disabled={isMaxReached}
            className="h-8.5 text-xs gap-1.5 cursor-pointer font-medium self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('addContact')}
          </Button>
        )}
      </div>

      {/* Contacts Cards Grid */}
      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-border text-center">
          <HeartHandshake className="w-10 h-10 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground font-mono">
            {t('emptyContacts')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex flex-col justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors relative group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-tight">
                        {contact.name}
                      </h4>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {contact.relationship}
                      </span>
                    </div>
                  </div>

                  {contact.isPrimary && (
                    <Badge
                      variant="default"
                      className="text-[10px] font-mono gap-1 px-1.5 py-0 h-5"
                    >
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {t('primaryBadge')}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5 pt-1 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground">{contact.phone}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(contact)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    {tCommon('edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingContactId(contact.id)}
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    {tCommon('delete')}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingContact ? t('editContact') : t('addContact')}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t('subtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-medium text-foreground block">
                  {t('name')} *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Siti Nurhaliza"
                  required
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground block">
                  {t('relationship')} *
                </label>
                <Input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Istri, Suami, Orang Tua, Saudara"
                  required
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground block">
                  {t('phone')} *
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +6281234567890"
                  required
                  className="h-8.5 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground block">
                  {t('email')}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. siti@example.com"
                  className="h-8.5 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPrimaryContact"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-border text-primary cursor-pointer w-4 h-4"
                />
                <label
                  htmlFor="isPrimaryContact"
                  className="text-xs text-foreground cursor-pointer select-none font-medium"
                >
                  {t('isPrimary')}
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="h-8 text-xs cursor-pointer"
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-8 text-xs cursor-pointer font-medium"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? tCommon('saving')
                  : tCommon('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingContactId}
        onOpenChange={(open) => !open && setDeletingContactId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              {t('deleteConfirmTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t('deleteConfirmDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingContactId(null)}
              className="h-8 text-xs cursor-pointer"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-8 text-xs cursor-pointer"
            >
              {deleteMutation.isPending
                ? tCommon('processing')
                : tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

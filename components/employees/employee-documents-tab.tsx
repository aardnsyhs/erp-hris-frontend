'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Filter,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Calendar,
  Clock,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import {
  downloadEmployeeDocument,
  useDeleteEmployeeDocument,
  useEmployeeDocuments,
  useUploadEmployeeDocument,
} from '@/hooks/use-employee-documents';
import { DocumentType, EmployeeDocument } from '@/types/employee-document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const DOCUMENT_TYPES: DocumentType[] = [
  'KTP',
  'NPWP',
  'BPJS_KES',
  'BPJS_TK',
  'IJAZAH',
  'SERTIFIKAT',
  'KONTRAK',
  'LAINNYA',
];

interface EmployeeDocumentsTabProps {
  employeeId: string;
  isHrAdmin: boolean;
  isSelf: boolean;
}

export function EmployeeDocumentsTab({
  employeeId,
  isHrAdmin,
  isSelf,
}: EmployeeDocumentsTabProps) {
  const t = useTranslations('employeeDocuments');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const canUpload = isHrAdmin;
  const canDelete = isHrAdmin;

  // Filter & Pagination State
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  // Hook Queries
  const { data, isLoading } = useEmployeeDocuments(employeeId, {
    page,
    limit: 10,
    documentType: selectedType !== 'ALL' ? (selectedType as DocumentType) : undefined,
  });

  const uploadMutation = useUploadEmployeeDocument(employeeId);
  const deleteMutation = useDeleteEmployeeDocument(employeeId);

  // Dialog States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // Form State
  const [docType, setDocType] = useState<DocumentType>('KTP');
  const [title, setTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const documents = data?.data || [];
  const meta = data?.meta;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    try {
      setDownloadingDocId(doc.id);
      await downloadEmployeeDocument(employeeId, doc.id, doc.fileName);
    } catch {
      // handled
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Ukuran file melebihi batas maksimal 10MB');
      setSelectedFile(null);
      return;
    }

    setFormError(null);
    setSelectedFile(file);
    if (!title) {
      // Auto-populate title from filename without extension
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      setTitle(baseName);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFormError('Silakan pilih file untuk diunggah');
      return;
    }
    if (!title.trim()) {
      setFormError('Judul dokumen wajib diisi');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', docType);
    formData.append('title', title.trim());
    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }

    try {
      await uploadMutation.mutateAsync(formData);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setTitle('');
      setExpiryDate('');
      setFormError(null);
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || 'Gagal mengunggah dokumen',
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingDocId) return;
    try {
      await deleteMutation.mutateAsync(deletingDocId);
      setDeletingDocId(null);
    } catch {
      // handled
    }
  };

  const isExpired = (expiryDateString?: string | null) => {
    if (!expiryDateString) return false;
    return new Date(expiryDateString) < new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        <Skeleton className="h-10 w-full bg-muted" />
        <Skeleton className="h-32 w-full bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-card border border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{t('title')}</h3>
            <Badge variant="outline" className="font-mono text-[10px]">
              {meta?.total ?? documents.length} {t('title').toLowerCase()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Document Type Filter */}
          <div className="w-40">
            <Select
              value={selectedType}
              onValueChange={(val) => {
                setSelectedType(val || 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue placeholder={t('docType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allTypes')}</SelectItem>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canUpload && (
            <Button
              size="sm"
              onClick={() => {
                setFormError(null);
                setSelectedFile(null);
                setTitle('');
                setExpiryDate('');
                setIsUploadOpen(true);
              }}
              className="h-8.5 text-xs gap-1.5 cursor-pointer font-medium"
            >
              <Upload className="w-3.5 h-3.5" />
              {t('uploadDocument')}
            </Button>
          )}
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-border text-center">
          <FolderOpen className="w-10 h-10 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground font-mono">
            {t('emptyDocs')}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden divide-y divide-border">
          {documents.map((doc) => {
            const expired = isExpired(doc.expiryDate);
            return (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-foreground">
                        {doc.title}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono uppercase px-1.5 py-0"
                      >
                        {doc.documentType}
                      </Badge>
                      {doc.expiryDate && (
                        <Badge
                          variant={expired ? 'destructive' : 'outline'}
                          className="text-[10px] font-mono px-1.5 py-0"
                        >
                          {expired ? t('expired') : `Exp: ${formatDate(doc.expiryDate)}`}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                      <span>{doc.fileName}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSizeBytes)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingDocId === doc.id || doc.scanStatus === 'QUARANTINED'}
                    className="h-8 text-xs gap-1.5 cursor-pointer font-mono"
                  >
                    {downloadingDocId === doc.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-primary" />
                    )}
                    {t('download')}
                  </Button>

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingDocId(doc.id)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sr-only">{tCommon('delete')}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUploadSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {t('uploadDocument')}
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
                  {t('docType')} *
                </label>
                <Select
                  value={docType}
                  onValueChange={(val) => setDocType(val as DocumentType)}
                >
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground block">
                  {t('docTitle')} *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. KTP Asli John Doe"
                  required
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground block">
                  {t('expiryDate')}
                </label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="h-8.5 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="font-medium text-foreground block">
                  {t('selectFile')} *
                </label>
                <Input
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  required
                  className="h-9 text-xs cursor-pointer file:cursor-pointer file:text-xs file:font-medium"
                />
                <p className="text-[10px] text-muted-foreground font-mono">
                  {t('fileHint')}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUploadOpen(false)}
                className="h-8 text-xs cursor-pointer"
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={uploadMutation.isPending}
                className="h-8 text-xs cursor-pointer font-medium"
              >
                {uploadMutation.isPending ? tCommon('saving') : t('uploadDocument')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingDocId}
        onOpenChange={(open) => !open && setDeletingDocId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              {t('deleteDocConfirmTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t('deleteDocConfirmDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingDocId(null)}
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
              {deleteMutation.isPending ? tCommon('processing') : tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

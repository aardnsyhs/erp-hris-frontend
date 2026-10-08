'use client';

import React, { useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useDomainLabel } from '@/hooks/use-domain-label';
import {
  ShieldCheck,
  Eye,
  Calendar,
  Layers,
  Activity,
  User as UserIcon,
  RotateCcw,
  Clock,
  Terminal,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { AuditLog } from '@/types/audit-log';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-picker';

const ENTITY_OPTIONS = [
  'User',
  'Employee',
  'Department',
  'LeaveRequest',
  'Payroll',
  'Attendance',
  'WorkSchedule',
];

const ACTION_OPTIONS = [
  'LOGIN',
  'LOGOUT',
  'LOGIN_FAILED',
  'CHANGE_PASSWORD',
  'CREATE',
  'UPDATE',
  'DELETE',
  'SOFT_DELETE',
  'TERMINATE',
  'REACTIVATE',
  'APPROVE',
  'REJECT',
  'PROCESS',
  'PAY',
];

export default function AuditLogsPage() {
  const t = useTranslations('auditLogs');
  const tUi = useTranslations('uiCopy');
  const domainLabel = useDomainLabel();
  const auditLabel = (group: 'actions' | 'entities', value?: string | null) =>
    value ? `${domainLabel(group, value)} (${value})` : '-';
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const currentUser = useAuthStore((state) => state.user);
  const isHrAdmin = currentUser?.role === 'HR_ADMIN';

  // Filters & Pagination State
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Snapshot Inspection Dialog State
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, isPlaceholderData } = useAuditLogs({
    page: pageIndex + 1,
    limit: pageSize,
    entity: selectedEntity !== 'ALL' ? selectedEntity : undefined,
    action: selectedAction !== 'ALL' ? selectedAction : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const auditLogs = data?.data || [];
  const meta = data?.meta;

  const handleResetFilters = () => {
    setSelectedEntity('ALL');
    setSelectedAction('ALL');
    setStartDate('');
    setEndDate('');
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

  const hasActiveFilters =
    selectedEntity !== 'ALL' ||
    selectedAction !== 'ALL' ||
    startDate !== '' ||
    endDate !== '';

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'APPROVE':
      case 'PAY':
      case 'REACTIVATE':
        return 'success';
      case 'UPDATE':
      case 'PROCESS':
        return 'default';
      case 'DELETE':
      case 'TERMINATE':
      case 'LOGIN_FAILED':
      case 'REJECT':
        return 'destructive';
      case 'LOGIN':
      case 'LOGOUT':
      case 'CHANGE_PASSWORD':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!isHrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-mono tracking-tight text-foreground">
          {t('accessDenied')}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          {t('accessDeniedDesc')}
        </p>
      </div>
    );
  }

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'createdAt',
      header: t('timestamp'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-foreground whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: 'actorEmail',
      header: t('actor'),
      cell: ({ row }) => {
        const email = row.original.actorEmail;
        const role = row.original.actorRole;
        if (!email && !role) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground">
              <Terminal className="w-3 h-3" />
              {t('systemActor')}
            </span>
          );
        }
        return (
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-medium truncate max-w-[200px]">
              {email || 'N/A'}
            </span>
            {role && (
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {domainLabel('roles', role)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'action',
      header: t('action'),
      cell: ({ row }) => (
        <Badge
          variant={getActionBadgeVariant(row.original.action) as any}
          className="font-mono text-[10px] tracking-wider uppercase font-semibold"
        >
          {auditLabel('actions', row.original.action)}
        </Badge>
      ),
    },
    {
      accessorKey: 'entity',
      header: t('entity'),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-foreground">
            {auditLabel('entities', row.original.entity)}
          </span>
          <span
            className="text-[10px] font-mono text-muted-foreground truncate max-w-[140px]"
            title={row.original.entityId}
          >
            {row.original.entityId}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'source',
      header: t('source'),
      cell: ({ row }) => (
        <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono text-[10px] font-medium border border-border">
          {row.original.source}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tCommon('actions')}</span>,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedLog(row.original)}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          {t('details')}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        badge={
          <Badge variant="outline" className="gap-1 font-mono text-[10px]">
            <ShieldCheck className="w-3 h-3 text-primary" />
            {t('badge')}
          </Badge>
        }
      />

      {/* Operational Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={selectedEntity}
          onValueChange={(val) => {
            setSelectedEntity(val || 'ALL');
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        >
          <SelectTrigger className="w-[170px] h-8.5 text-xs bg-card border-border rounded-md font-mono">
            <SelectValue placeholder={t('filterByEntity')}>
              {selectedEntity === 'ALL' ? t('allEntities') : auditLabel('entities', selectedEntity)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">{t('allEntities')}</SelectItem>
            {ENTITY_OPTIONS.map((entity) => (
              <SelectItem key={entity} value={entity} className="text-xs">
                {auditLabel('entities', entity)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedAction}
          onValueChange={(val) => {
            setSelectedAction(val || 'ALL');
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        >
          <SelectTrigger className="w-[170px] h-8.5 text-xs bg-card border-border rounded-md font-mono">
            <SelectValue placeholder={t('filterByAction')}>
              {selectedAction === 'ALL' ? t('allActions') : auditLabel('actions', selectedAction)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">{t('allActions')}</SelectItem>
            {ACTION_OPTIONS.map((action) => (
              <SelectItem key={action} value={action} className="text-xs">
                {auditLabel('actions', action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-[230px]">
          <DateRangePicker
            from={startDate}
            to={endDate}
            placeholder={t('timestamp')}
            onChange={(range) => {
              setStartDate(range.from);
              setEndDate(range.to);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleResetFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-8.5 px-2 font-mono cursor-pointer"
          >
            <X className="w-3 h-3 mr-1" />
            {tCommon('resetFilter')}
          </Button>
        )}
      </div>

      {/* Main Audit Logs DataTable */}
      <DataTable
        columns={columns}
        data={auditLogs}
        isLoading={isLoading}
        pageCount={meta?.totalPages ?? -1}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={setPagination}
        totalRows={meta?.total}
        emptyTitle={tCommon('empty')}
        emptyDescription={tCommon('noData')}
      />

      {/* Snapshot Detail Dialog */}
      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  selectedLog
                    ? (getActionBadgeVariant(selectedLog.action) as any)
                    : 'default'
                }
                className="font-mono text-xs"
              >
                {auditLabel('actions', selectedLog?.action)}
              </Badge>
              <DialogTitle className="text-base font-bold font-mono">
                {auditLabel('entities', selectedLog?.entity)} #{selectedLog?.entityId}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              {t('snapshotSubtitle')}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-md bg-muted/40 border border-border text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {t('timestamp')}
                  </span>
                  <span className="font-mono text-[11px] font-medium text-foreground">
                    {formatDate(selectedLog.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {t('actor')}
                  </span>
                  <span className="font-mono text-[11px] font-medium text-foreground truncate block">
                    {selectedLog.actorEmail || (selectedLog.actorRole ? domainLabel('roles', selectedLog.actorRole) : t('systemActor'))}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {t('source')} / {t('ipAddress')}
                  </span>
                  <span className="font-mono text-[11px] text-foreground">
                    {selectedLog.source} {selectedLog.ipAddress ? `(${selectedLog.ipAddress})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {t('correlationId')}
                  </span>
                  <span
                    className="font-mono text-[10px] text-muted-foreground truncate block"
                    title={selectedLog.correlationId || '-'}
                  >
                    {selectedLog.correlationId || '-'}
                  </span>
                </div>
              </div>

              {/* Snapshots: Before & After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before State */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-foreground font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    {t('beforeState')}
                  </span>
                  <pre className="p-3 rounded-md bg-zinc-950 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-64 border border-zinc-800 selection:bg-zinc-800">
                    {selectedLog.before
                      ? JSON.stringify(selectedLog.before, null, 2)
                      : t('noState')}
                  </pre>
                </div>

                {/* After State */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-foreground font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    {t('afterState')}
                  </span>
                  <pre className="p-3 rounded-md bg-zinc-950 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-64 border border-zinc-800 selection:bg-zinc-800">
                    {selectedLog.after
                      ? JSON.stringify(selectedLog.after, null, 2)
                      : t('noState')}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

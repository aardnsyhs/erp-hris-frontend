'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  History,
  Calendar,
  TrendingUp,
  ArrowRightLeft,
  TrendingDown,
  UserPlus,
  Ban,
  RotateCcw,
  Building2,
  Briefcase,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useMovementHistory } from '@/hooks/use-movement-history';
import { MovementType } from '@/types/movement-history';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface MovementHistoryTabProps {
  employeeId: string;
}

export function MovementHistoryTab({ employeeId }: MovementHistoryTabProps) {
  const locale = useLocale();

  const { data: movements = [], isLoading } = useMovementHistory(employeeId);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getMovementTypeMeta = (type: MovementType) => {
    switch (type) {
      case 'HIRE':
        return {
          label: 'Penerimaan / Hire',
          icon: UserPlus,
          badgeClass:
            'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          dotClass: 'border-blue-500 bg-blue-500',
        };
      case 'PROMOTION':
        return {
          label: 'Promosi Jabatan',
          icon: TrendingUp,
          badgeClass:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dotClass: 'border-emerald-500 bg-emerald-500',
        };
      case 'TRANSFER':
        return {
          label: 'Mutasi / Rotasi',
          icon: ArrowRightLeft,
          badgeClass:
            'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          dotClass: 'border-purple-500 bg-purple-500',
        };
      case 'DEMOTION':
        return {
          label: 'Demosi',
          icon: TrendingDown,
          badgeClass:
            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dotClass: 'border-amber-500 bg-amber-500',
        };
      case 'REORGANIZATION':
        return {
          label: 'Reorganisasi',
          icon: RotateCcw,
          badgeClass:
            'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          dotClass: 'border-sky-500 bg-sky-500',
        };
      case 'TERMINATION':
        return {
          label: 'Pemberhentian (Terminated)',
          icon: Ban,
          badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
          dotClass: 'border-destructive bg-destructive',
        };
      case 'REACTIVATION':
        return {
          label: 'Reaktivasi',
          icon: UserCheck,
          badgeClass:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dotClass: 'border-emerald-500 bg-emerald-500',
        };
      default:
        return {
          label: type,
          icon: History,
          badgeClass: '',
          dotClass: 'border-muted-foreground bg-muted-foreground',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          Riwayat Perpindahan Karyawan (Movement History)
          <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
            Append-Only Audit Log
          </Badge>
        </h3>
        <p className="text-xs text-muted-foreground">
          Buku besar jejak pergerakan status, mutasi departemen, dan promosi jabatan yang tercatat permanen secara otomatis oleh sistem.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      ) : movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center bg-muted/20">
          <History className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-foreground">
            Belum ada rekam jejak perpindahan
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Setiap kali terjadi penugasan baru, promosi, mutasi, atau pemberhentian, sistem akan otomatis mencatatnya di sini.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-border space-y-6 pt-2">
          {movements.map((item) => {
            const meta = getMovementTypeMeta(item.movementType);
            const Icon = meta.icon;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Node */}
                <div
                  className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background ${meta.dotClass}`}
                />

                <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`gap-1 font-medium text-xs ${meta.badgeClass}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Efektif: <strong className="text-foreground">{formatDate(item.effectiveDate)}</strong>
                      </span>
                    </div>

                    {item.performedBy && (
                      <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        Diproses oleh: <strong className="text-foreground">{item.performedBy.email}</strong> ({item.performedBy.role})
                      </span>
                    )}
                  </div>

                  {/* Transition Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/20 p-3 rounded-lg border border-border/40">
                    {/* Position Change */}
                    <div className="space-y-1">
                      <span className="font-semibold text-muted-foreground flex items-center gap-1 text-[11px]">
                        <Briefcase className="h-3 w-3" />
                        Perubahan Jabatan:
                      </span>
                      <p className="text-foreground">
                        {item.fromPosition ? (
                          <>
                            <span className="line-through text-muted-foreground">
                              {item.fromPosition.title} ({item.fromPosition.code})
                            </span>{' '}
                            →{' '}
                          </>
                        ) : null}
                        {item.toPosition ? (
                          <strong className="text-foreground font-semibold">
                            {item.toPosition.title} ({item.toPosition.code})
                          </strong>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </p>
                    </div>

                    {/* Department Change */}
                    <div className="space-y-1">
                      <span className="font-semibold text-muted-foreground flex items-center gap-1 text-[11px]">
                        <Building2 className="h-3 w-3" />
                        Perubahan Departemen:
                      </span>
                      <p className="text-foreground">
                        {item.fromDepartment ? (
                          <>
                            <span className="line-through text-muted-foreground">
                              {item.fromDepartment.name}
                            </span>{' '}
                            →{' '}
                          </>
                        ) : null}
                        {item.toDepartment ? (
                          <strong className="text-foreground font-semibold">
                            {item.toDepartment.name}
                          </strong>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {item.reason && (
                    <p className="text-xs text-muted-foreground italic">
                      Alasan: &quot;{item.reason}&quot;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

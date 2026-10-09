'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { RefreshCw, Copy } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useHrBrief } from '@/hooks/use-hr-brief';
import { useDepartmentTree } from '@/hooks/use-departments';
import { useApiError } from '@/hooks/use-api-error';
import { PageHeader } from '@/components/shared/page-header';
import { MetricStrip } from '@/components/shared/metric-strip';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateRangePicker } from '@/components/ui/date-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  briefDate,
  briefUpdatedAt,
  buildBriefSummary,
  contractSourceLink,
  defaultBriefPeriod,
  payrollGroupSourceLink,
  validBriefPeriod,
  flattenBriefDepartments,
  pendingLeaveSourceLink,
} from '@/lib/hr-brief';
import type { BriefCollection, BriefContract } from '@/types/hr-brief';

function WorkSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card min-w-0">
      <h3 className="flex flex-wrap items-baseline gap-2 border-b border-border px-4 py-3 text-sm font-semibold">
        {title}
        <span className="text-muted-foreground tabular-nums">{count}</span>
      </h3>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  );
}

export default function HrBriefPage() {
  const t = useTranslations('hrBrief');
  const role = useAuthStore((state) => state.user?.role);
  if (role !== 'HR_ADMIN')
    return (
      <p role="alert" className="text-sm">
        {t('adminOnly')}
      </p>
    );
  return <HrBriefContent />;
}

function HrBriefContent() {
  const t = useTranslations('hrBrief');
  const locale = useLocale();
  const apiError = useApiError();
  const [period, setPeriod] = useState(() => defaultBriefPeriod());
  const [departmentId, setDepartmentId] = useState('ALL');
  const [copying, setCopying] = useState(false);
  const [allLeaves, setAllLeaves] = useState(false);
  const [payrollRecordsOpen, setPayrollRecordsOpen] = useState(false);
  const [allPayrolls, setAllPayrolls] = useState(false);
  const validPeriod = validBriefPeriod(period.startDate, period.endDate);
  const query = useHrBrief(
    {
      ...period,
      departmentId: departmentId === 'ALL' ? undefined : departmentId,
    },
    validPeriod,
  );
  const departmentQuery = useDepartmentTree({ includeArchived: true });
  const departments = flattenBriefDepartments(departmentQuery.data ?? []);
  const scope =
    departmentId === 'ALL'
      ? t('allDepartments')
      : (departments.find((item) => item.id === departmentId)?.name ??
        t('selectedDepartment'));
  const brief = query.data;
  const summary = brief ? buildBriefSummary(brief, locale, scope, t) : '';
  const format = (value: string) => briefDate(value, locale);
  const sourceClass = `${buttonVariants({ variant: 'outline', size: 'sm' })} min-h-11 sm:min-h-8`;
  const remaining = (count: number) =>
    count > 0 ? (
      <p className="text-sm text-muted-foreground">
        {t('remaining', { count })}
      </p>
    ) : null;
  const empty = <p className="text-sm text-muted-foreground">{t('empty')}</p>;

  async function copySummary() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(summary);
      toast.success(t('copied'));
    } catch {
      toast.error(t('copyFailed'));
    } finally {
      setCopying(false);
    }
  }

  function contracts(collection: BriefCollection<BriefContract>) {
    return (
      <>
        {collection.items.length === 0 ? (
          empty
        ) : (
          <ul className="divide-y divide-border">
            {collection.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 break-words">
                  <p className="text-sm font-medium">
                    {item.employee.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.contractNumber} · {format(item.endDate)}
                  </p>
                </div>
                <Link
                  href={contractSourceLink(item.employeeId, item.id)}
                  className={`${sourceClass} self-start shrink-0`}
                >
                  {t('viewContract')}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {remaining(collection.remaining)}
      </>
    );
  }

  return (
    <div className="space-y-5 min-w-0">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button
            className="min-h-11 sm:min-h-9"
            variant="outline"
            onClick={() => query.refetch()}
            disabled={query.isFetching || !validPeriod}
          >
            <RefreshCw className="size-4" />
            {t('refresh')}
          </Button>
        }
      />
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
          <div className="space-y-2 min-w-0">
            <p className="text-sm font-medium">{t('period')}</p>
            <DateRangePicker
              className="min-h-11 sm:min-h-8.5"
              from={period.startDate}
              to={period.endDate}
              ariaLabel={t('period')}
              onChange={({ from, to }) =>
                setPeriod(
                  from && to
                    ? { startDate: from, endDate: to }
                    : defaultBriefPeriod(),
                )
              }
            />
          </div>
          <div className="space-y-2 min-w-0">
            <label id="brief-department-label" className="text-sm font-medium">
              {t('department')}
            </label>
            <Select
              value={departmentId}
              onValueChange={(value) => {
                setDepartmentId(value ?? 'ALL');
                setAllLeaves(false);
                setPayrollRecordsOpen(false);
                setAllPayrolls(false);
              }}
              disabled={departmentQuery.isPending || departmentQuery.isError}
            >
              <SelectTrigger
                className="w-full min-h-11 sm:min-h-9"
                aria-labelledby="brief-department-label"
              >
                <SelectValue>{scope}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allDepartments')}</SelectItem>
                {departments.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {departmentQuery.isError && (
          <p role="alert" className="text-sm text-destructive">
            {t('departmentsFailed')}{' '}
            <Button
              className="min-h-11 sm:min-h-8"
              size="sm"
              variant="outline"
              onClick={() => departmentQuery.refetch()}
            >
              {t('retry')}
            </Button>
          </p>
        )}
        {!validPeriod && (
          <p role="alert" className="text-sm text-destructive">
            {t('invalidPeriod')}
          </p>
        )}
        {brief && validPeriod && !query.isError && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t('updated', { time: briefUpdatedAt(brief.generatedAt, locale) })}
          </p>
        )}
      </div>
      {query.isPending && validPeriod && (
        <div role="status" aria-label={t('loading')} className="space-y-3">
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
      {query.isError && (
        <div
          role="alert"
          className="rounded-lg border border-border p-4 space-y-3"
        >
          <p className="text-sm">{apiError(query.error, t('loadFailed'))}</p>
          <Button
            className="min-h-11 sm:min-h-9"
            variant="outline"
            onClick={() => query.refetch()}
          >
            {t('retry')}
          </Button>
        </div>
      )}
      {brief && validPeriod && !query.isError && (
        <>
          <MetricStrip
            metrics={[
              {
                id: 'leaves',
                label: t('pendingLeaves'),
                value: brief.open.leaves.total,
                description: t('currentStatus'),
              },
              {
                id: 'contracts',
                label: t('expiringContracts'),
                value: brief.open.upcomingContracts.total,
                description: t('horizon', { days: brief.contractHorizon.days }),
              },
              {
                id: 'expired',
                label: t('expiredActiveContracts'),
                value: brief.open.expiredActiveContracts.total,
                description: t('currentStatus'),
              },
              {
                id: 'payroll',
                label: t('unpaidPayroll'),
                value: brief.open.payrolls.total,
                description: t('currentStatus'),
              },
            ]}
          />
          <div className="space-y-3">
            <h2 className="text-base font-semibold">{t('attention')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('openScope', { date: format(brief.referenceDate) })}
            </p>
            <WorkSection
              title={t('pendingLeaves')}
              count={brief.open.leaves.total}
            >
              {brief.open.leaves.items.length === 0 ? (
                empty
              ) : (
                <ul id="brief-leaves" className="divide-y divide-border">
                  {brief.open.leaves.items
                    .slice(0, allLeaves ? undefined : 5)
                    .map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 break-words">
                          <p className="text-sm font-medium">
                            {item.employee.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(item.startDate)} – {format(item.endDate)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t('submitted', {
                              date: briefUpdatedAt(item.createdAt, locale),
                            })}
                          </p>
                          {item.datesPassed && (
                            <p className="text-sm text-status-warning">
                              {t('datesPassed')}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/leave-requests/${encodeURIComponent(item.id)}`}
                          className={`${sourceClass} self-start shrink-0`}
                        >
                          {t('viewLeave')}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
              {brief.open.leaves.items.length > 5 && (
                <Button
                  variant="outline"
                  className="min-h-11"
                  aria-controls="brief-leaves"
                  aria-expanded={allLeaves}
                  onClick={() => setAllLeaves(!allLeaves)}
                >
                  {t(allLeaves ? 'showLess' : 'showMore')}
                </Button>
              )}
              {remaining(
                Math.max(
                  0,
                  brief.open.leaves.total -
                    (allLeaves
                      ? brief.open.leaves.items.length
                      : Math.min(5, brief.open.leaves.items.length)),
                ),
              )}
              {brief.open.leaves.total > brief.open.leaves.items.length && (
                <Link
                  className={sourceClass}
                  href={pendingLeaveSourceLink(departmentId)}
                >
                  {t('viewAllLeaves')}
                </Link>
              )}
            </WorkSection>
            <WorkSection
              title={t('expiringContracts')}
              count={brief.open.upcomingContracts.total}
            >
              <p className="text-sm text-muted-foreground">
                {t('contractRange', {
                  start: format(brief.referenceDate),
                  end: format(brief.contractHorizon.endDate),
                })}
              </p>
              {contracts(brief.open.upcomingContracts)}
            </WorkSection>
            <WorkSection
              title={t('expiredActiveContracts')}
              count={brief.open.expiredActiveContracts.total}
            >
              {contracts(brief.open.expiredActiveContracts)}
            </WorkSection>
            <WorkSection
              title={t('unpaidPayroll')}
              count={brief.open.payrolls.total}
            >
              <p className="text-sm text-muted-foreground">
                {t('payrollScope')}
              </p>
              {brief.open.payrolls.groups.length === 0 ? (
                empty
              ) : (
                <ul className="divide-y divide-border">
                  {brief.open.payrolls.groups.map((group) => (
                    <li
                      key={`${group.periodStart}-${group.periodEnd}-${group.status}`}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span>
                          {format(group.periodStart)} –{' '}
                          {format(group.periodEnd)}
                        </span>
                        <StatusBadge status={group.status} />
                        <span>{t('recordCount', { count: group.total })}</span>
                      </div>
                      <Link
                        href={payrollGroupSourceLink(group, brief.departmentId)}
                        className={sourceClass}
                      >
                        {t('viewPayrollGroup')}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {brief.open.payrolls.items.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    className="min-h-11"
                    aria-controls="brief-payroll-records"
                    aria-expanded={payrollRecordsOpen}
                    onClick={() => {
                      setPayrollRecordsOpen(!payrollRecordsOpen);
                      setAllPayrolls(false);
                    }}
                  >
                    {t(payrollRecordsOpen ? 'hideRecords' : 'showRecords')}
                  </Button>
                  <div id="brief-payroll-records" hidden={!payrollRecordsOpen}>
                    <h4 className="text-sm font-semibold">
                      {t('payrollRecords')}
                    </h4>
                    <ul
                      id="brief-payroll-list"
                      className="divide-y divide-border"
                    >
                      {brief.open.payrolls.items
                        .slice(0, allPayrolls ? undefined : 5)
                        .map((item) => (
                          <li
                            key={item.id}
                            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0 break-words">
                              <p className="text-sm font-medium">
                                {item.employee.fullName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(item.periodStart)} –{' '}
                                {format(item.periodEnd)}
                              </p>
                              <StatusBadge status={item.status} />
                            </div>
                            <Link
                              href={`/payrolls/${encodeURIComponent(item.id)}`}
                              className={`${sourceClass} self-start shrink-0`}
                            >
                              {t('viewPayroll')}
                            </Link>
                          </li>
                        ))}
                    </ul>
                    {brief.open.payrolls.items.length > 5 && (
                      <Button
                        variant="outline"
                        className="min-h-11"
                        aria-controls="brief-payroll-list"
                        aria-expanded={allPayrolls}
                        onClick={() => setAllPayrolls(!allPayrolls)}
                      >
                        {t(allPayrolls ? 'showLess' : 'showMore')}
                      </Button>
                    )}
                  </div>
                </>
              )}
              {remaining(
                Math.max(
                  0,
                  brief.open.payrolls.total -
                    (payrollRecordsOpen
                      ? allPayrolls
                        ? brief.open.payrolls.items.length
                        : Math.min(5, brief.open.payrolls.items.length)
                      : 0),
                ),
              )}
            </WorkSection>
          </div>
          <section className="space-y-3">
            <h2 className="text-base font-semibold">{t('attendance')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('periodScope', {
                start: format(brief.period.startDate),
                end: format(brief.period.endDate),
              })}
            </p>
            <MetricStrip
              metrics={[
                {
                  id: 'present',
                  label: t('present'),
                  value: brief.attendance.PRESENT,
                },
                { id: 'late', label: t('late'), value: brief.attendance.LATE },
                {
                  id: 'absent',
                  label: t('absent'),
                  value: brief.attendance.ABSENT,
                },
                {
                  id: 'recorded',
                  label: t('recorded'),
                  value: brief.attendance.recordedEmployeeDays,
                },
              ]}
            />
            <p className="text-sm text-muted-foreground">
              {t('missingRecords')}
            </p>
          </section>
          <section className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">{t('summary')}</h2>
              <Button
                className="min-h-11 sm:min-h-9"
                variant="outline"
                onClick={copySummary}
                disabled={copying || query.isFetching}
              >
                <Copy className="size-4" />
                {t('copy')}
              </Button>
            </div>
            <p className="whitespace-pre-line break-words text-sm leading-relaxed">
              {summary}
            </p>
          </section>
        </>
      )}
    </div>
  );
}

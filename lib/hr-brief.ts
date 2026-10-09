import type { HrBrief } from '@/types/hr-brief';
import type { DepartmentTreeNode } from '@/types/department';

export function pendingLeaveSourceLink(departmentId?: string): string {
  const params = new URLSearchParams({ status: 'PENDING' });
  if (departmentId && departmentId !== 'ALL')
    params.set('departmentId', departmentId);
  return `/leave-requests?${params}`;
}

export function flattenBriefDepartments(
  nodes: DepartmentTreeNode[],
): DepartmentTreeNode[] {
  return nodes.flatMap((node) => [
    node,
    ...flattenBriefDepartments(node.children),
  ]);
}

export function wibCalendarDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function defaultBriefPeriod(now = new Date()) {
  const endDate = wibCalendarDate(now);
  const startDate = new Date(
    new Date(`${endDate}T00:00:00Z`).getTime() - 6 * 86_400_000,
  )
    .toISOString()
    .slice(0, 10);
  return { startDate, endDate };
}

export function validBriefPeriod(start: string, end: string) {
  const parse = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`);
    return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(date.getTime()) &&
      date.getUTCFullYear() >= 1 &&
      date.toISOString().slice(0, 10) === value
      ? date.getTime()
      : NaN;
  };
  const days = (parse(end) - parse(start)) / 86_400_000 + 1;
  return days >= 1 && days <= 90;
}

export function briefDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function briefUpdatedAt(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
    hourCycle: 'h23',
  }).format(new Date(value));
}

type SummaryTranslator = (
  key: string,
  values: Record<string, string | number>,
) => string;
export function buildBriefSummary(
  brief: HrBrief,
  locale: string,
  scope: string,
  t: SummaryTranslator,
) {
  return t('summaryTemplate', {
    start: briefDate(brief.period.startDate, locale),
    end: briefDate(brief.period.endDate, locale),
    updated: briefUpdatedAt(brief.generatedAt, locale),
    reference: briefDate(brief.referenceDate, locale),
    scope,
    present: brief.attendance.PRESENT,
    late: brief.attendance.LATE,
    absent: brief.attendance.ABSENT,
    recorded: brief.attendance.recordedEmployeeDays,
    leaves: brief.open.leaves.total,
    contracts: brief.open.upcomingContracts.total,
    expired: brief.open.expiredActiveContracts.total,
    payrolls: brief.open.payrolls.total,
    days: brief.contractHorizon.days,
  });
}

export function contractSourceLink(employeeId: string, contractId: string) {
  return `/employees/${encodeURIComponent(employeeId)}?tab=contracts&contractId=${encodeURIComponent(contractId)}`;
}

export function payrollGroupSourceLink(
  group: { periodStart: string; periodEnd: string; status: string },
  departmentId: string | null,
) {
  const params = new URLSearchParams({
    periodStart: group.periodStart,
    periodEnd: group.periodEnd,
    status: group.status,
    exactPeriod: 'true',
  });
  if (departmentId) params.set('departmentId', departmentId);
  return `/payrolls?${params}`;
}

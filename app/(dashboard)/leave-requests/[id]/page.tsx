'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLeaveRequest } from '@/hooks/use-leave-requests';
import { useApiError } from '@/hooks/use-api-error';
import { LeaveDetailDialog } from '@/components/leave-requests/leave-detail-dialog';
import { Button, buttonVariants } from '@/components/ui/button';

export default function LeaveSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const query = useLeaveRequest(id);
  const router = useRouter();
  const t = useTranslations('hrBrief');
  const apiError = useApiError();
  return (
    <div className="space-y-4">
      <Link href="/hr-brief" className={buttonVariants({ variant: 'outline' })}>
        {t('back')}
      </Link>
      {query.isPending && <p role="status">{t('loading')}</p>}
      {query.isError && (
        <div role="alert">
          <p>{apiError(query.error, t('sourceFailed'))}</p>
          <Button onClick={() => query.refetch()}>{t('retry')}</Button>
        </div>
      )}
      {query.data && !query.isError && (
        <LeaveDetailDialog
          leaveRequest={query.data}
          open
          onOpenChange={(open) => {
            if (!open) router.replace('/hr-brief');
          }}
        />
      )}
    </div>
  );
}

import Link from 'next/link';

import { markNotificationReadAction } from '@/app/actions';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';
import { listNotifications } from '@/lib/data';
import { formatRelative } from '@/lib/utils';

export default async function NotificationsPage() {
  const viewer = await getViewerOrRedirect();
  const notifications = await listNotifications(viewer.userId);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Notifications</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Every invite, approval, and release event</h1>
      </section>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Surface key={notification.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold text-ink">{notification.message}</p>
              <p className="mt-2 text-sm text-slate-500">{formatRelative(notification.createdAt)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={notification.link} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50">
                Open
              </Link>
              {!notification.read ? (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="notificationId" value={notification.id} />
                  <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">Mark as read</button>
                </form>
              ) : null}
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}

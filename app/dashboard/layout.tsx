import { DashboardShell } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';
import { listNotifications } from '@/lib/mock-db';

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const viewer = await getViewerOrRedirect();
  const notifications = listNotifications(viewer.userId);

  return (
    <DashboardShell
      roleLabel={viewer.role === 'client' ? 'Client dashboard' : 'Provider dashboard'}
      viewerName={viewer.fullName}
      unreadNotifications={notifications.filter((entry) => !entry.read).length}
    >
      {children}
    </DashboardShell>
  );
}

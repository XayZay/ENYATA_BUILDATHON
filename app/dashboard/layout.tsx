import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';
import { getProviderProfile, listNotifications } from '@/lib/data';

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const viewer = await getViewerOrRedirect();
  const notifications = await listNotifications(viewer.userId);
  const providerProfile = viewer.role === 'provider' ? await getProviderProfile(viewer.userId) : null;

  if (viewer.role === 'provider' && !providerProfile) {
    redirect('/auth/provider-profile');
  }

  return (
    <DashboardShell
      roleLabel={viewer.role === 'client' ? 'Client dashboard' : 'Provider dashboard'}
      viewerName={viewer.fullName}
      unreadNotifications={notifications.filter((entry) => !entry.read).length}
      profileHref={viewer.role === 'provider' ? '/auth/provider-profile' : undefined}
    >
      {children}
    </DashboardShell>
  );
}

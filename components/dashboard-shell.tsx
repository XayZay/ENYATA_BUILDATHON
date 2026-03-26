import Link from 'next/link';
import type { ReactNode } from 'react';

import { logoutAction } from '@/app/actions';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  roleLabel: string;
  viewerName: string;
  unreadNotifications: number;
  profileHref?: string;
  children: ReactNode;
}

export function DashboardShell({ roleLabel, viewerName, unreadNotifications, profileHref, children }: DashboardShellProps) {
  const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/projects', label: 'Projects' },
    ...(profileHref ? [{ href: profileHref, label: 'Profile' }] : []),
    { href: '/dashboard/notifications', label: 'Notifications' }
  ];

  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
          <div>
            <Link href="/dashboard" className="text-2xl font-semibold tracking-tight text-ink">
              CrossRoute
            </Link>
            <p className="text-sm text-slate-500">Escrow that adapts. Payments that optimize.</p>
          </div>
          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-line hover:bg-slate-50 hover:text-ink"
              >
                {item.label}
                {item.href.endsWith('notifications') && unreadNotifications > 0 ? ' (' + unreadNotifications + ')' : ''}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-line bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-sm font-semibold text-ink">{viewerName}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{roleLabel}</p>
            </div>
            <form action={logoutAction}>
              <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-[1.5rem] border border-line bg-white p-6 shadow-soft', className)}>{children}</div>;
}

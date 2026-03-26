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
    { href: '/dashboard', label: 'Dashboard', eyebrow: 'Overview' },
    { href: '/dashboard/projects', label: 'My Projects', eyebrow: 'Escrow' },
    ...(profileHref ? [{ href: profileHref, label: 'Profile', eyebrow: 'Identity' }] : []),
    { href: '/dashboard/notifications', label: 'Notifications', eyebrow: 'Inbox' }
  ];

  return (
    <div className="min-h-screen bg-mist text-ink">
      <div className="mx-auto flex max-w-[1550px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <aside className="hidden w-[286px] shrink-0 flex-col rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur lg:flex">
          <Link href="/dashboard" className="block">
            <p className="text-3xl font-semibold tracking-tight text-accent">CrossRoute</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Escrow and payout routing</p>
          </Link>

          <nav className="mt-10 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-[1.35rem] border border-transparent px-4 py-3 transition hover:border-blue-100 hover:bg-blue-50/80"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.eyebrow}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{item.label}</p>
                </div>
                {item.href.endsWith('notifications') && unreadNotifications > 0 ? (
                  <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">{unreadNotifications}</span>
                ) : (
                  <span className="text-slate-300 transition group-hover:text-blue-500">?</span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-[1.6rem] border border-blue-100 bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_100%)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Workspace</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{roleLabel}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Navigate projects, approvals, and payout decisions from one shared operating layer.
            </p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="glass-panel px-5 py-4 lg:px-6">
            <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap lg:justify-between">
              <div className="min-w-[240px] flex-1 rounded-[1.25rem] border border-blue-100 bg-[#f7faff] px-4 py-3 text-sm text-slate-500">
                Search projects, payouts, or providers across your workspace.
              </div>
              <div className="flex items-center gap-3">
                <Link href="/dashboard/notifications" className="relative flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
                  <span className="text-lg">??</span>
                  {unreadNotifications > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" /> : null}
                </Link>
                <div className="flex items-center gap-3 rounded-[1.2rem] border border-blue-100 bg-white px-3 py-2 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#2f5eff_0%,#153abf_100%)] text-sm font-semibold text-white">
                    {viewerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{viewerName}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{roleLabel}</p>
                  </div>
                </div>
                <form action={logoutAction}>
                  <button className="rounded-full border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </header>

          <main className="px-1 py-6 lg:px-2">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('glass-panel p-6', className)}>{children}</div>;
}


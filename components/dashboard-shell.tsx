import Link from 'next/link';
import type { IconType } from 'react-icons';
import { MdDashboard, MdFolderShared, MdInbox, MdPerson } from 'react-icons/md';
import type { ReactNode } from 'react';

import { logoutAction } from '@/app/actions';
import { WorkspaceSearchForm } from '@/components/workspace-search-form';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  roleLabel: string;
  viewerName: string;
  unreadNotifications: number;
  profileHref?: string;
  children: ReactNode;
}

type NavItem = {
  href: string;
  label: string;
  eyebrow: string;
  icon: IconType;
};

export function DashboardShell({ roleLabel, viewerName, unreadNotifications, profileHref, children }: DashboardShellProps) {
  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', eyebrow: 'Overview', icon: MdDashboard },
    { href: '/dashboard/projects', label: 'My Projects', eyebrow: 'Escrow', icon: MdFolderShared },
    ...(profileHref ? [{ href: profileHref, label: 'Profile', eyebrow: 'Identity', icon: MdPerson }] : []),
    { href: '/dashboard/notifications', label: 'Notifications', eyebrow: 'Inbox', icon: MdInbox }
  ];

  return (
    <div className="min-h-screen bg-mist text-ink">
      <div className="mx-auto max-w-[1550px] px-4 py-4 lg:px-6 lg:py-6">
        <div className="mb-4 rounded-[1.4rem] border border-white/70 bg-white/90 p-3 shadow-soft backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="block">
              <p className="text-xl font-semibold tracking-tight text-accent">CrossRoute</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Dashboard nav</p>
            </Link>
            <div className="rounded-full border border-blue-100 bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_100%)] px-2.5 py-1.5 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">Workspace</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-950">{roleLabel}</p>
            </div>
          </div>

          <nav className="mt-3 flex flex-wrap gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-blue-100 bg-[#f7faff] px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/80"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="text-sm text-blue-700" />
                    <span>{item.label}</span>
                    {item.href.endsWith('notifications') && unreadNotifications > 0 ? (
                      <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {unreadNotifications}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-3">
            <WorkspaceSearchForm />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 rounded-[1rem] border border-blue-100 bg-white px-2.5 py-2 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#2f5eff_0%,#153abf_100%)] text-xs font-semibold text-white">
                {viewerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{viewerName}</p>
                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-slate-500">{roleLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
              >
                <MdInbox className="text-base" />
                {unreadNotifications > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" /> : null}
              </Link>
              <form action={logoutAction}>
                <button className="rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden min-h-full w-[286px] shrink-0 flex-col rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur lg:flex">
            <Link href="/dashboard" className="block">
              <p className="text-3xl font-semibold tracking-tight text-accent">CrossRoute</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Escrow and settlement timing</p>
            </Link>

            <nav className="mt-10 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-[1.35rem] border border-transparent px-4 py-3 transition hover:border-blue-100 hover:bg-blue-50/80"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#f7faff] text-blue-700 transition group-hover:bg-white">
                      <Icon className="text-[1.25rem]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.eyebrow}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">{item.label}</p>
                        {item.href.endsWith('notifications') && unreadNotifications > 0 ? (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">{unreadNotifications}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-[1.6rem] border border-blue-100 bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_100%)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Workspace</p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{roleLabel}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Navigate escrow, approvals, and settlement timing decisions from one shared operating layer.
              </p>
            </div>
          </aside>

          <div className="flex-1">
            <header className="hidden glass-panel px-5 py-4 lg:block lg:px-6">
              <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap lg:justify-between">
                <WorkspaceSearchForm />
                <div className="flex items-center gap-3">
                  <Link href="/dashboard/notifications" className="relative flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
                    <MdInbox className="text-lg" />
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
    </div>
  );
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('glass-panel p-6', className)}>{children}</div>;
}

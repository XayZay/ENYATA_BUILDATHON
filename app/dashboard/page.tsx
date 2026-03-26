import Link from 'next/link';

import { Surface } from '@/components/dashboard-shell';
import { SummaryCard } from '@/components/summary-card';
import { getViewerOrRedirect } from '@/lib/auth';
import { getDashboardSummary, listProjects } from '@/lib/mock-db';
import { formatUsd } from '@/lib/utils';

export default async function DashboardPage() {
  const viewer = await getViewerOrRedirect();
  const summary = getDashboardSummary(viewer);
  const projects = listProjects(viewer).slice(0, 2);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Overview</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">{viewer.role === 'client' ? 'Manage protected projects' : 'Track work and optimize payouts'}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            {viewer.role === 'client'
              ? 'Create milestone-based escrow projects, approve scope changes, and release funds only when work is done.'
              : 'Monitor project delivery, handle change orders, and compare NGN payout routes after milestone release.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/projects" className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white">
            View all projects
          </Link>
          {viewer.role === 'client' ? (
            <Link href="/dashboard/projects/new" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
              Create project
            </Link>
          ) : null}
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard eyebrow="Active projects" value={String(summary.activeProjects)} detail="Projects still moving through escrow or delivery." accent={<span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Live</span>} />
        <SummaryCard eyebrow="Change requests" value={String(summary.changeRequests)} detail="Projects that need a scope-change decision right now." accent={<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Shield</span>} />
        <SummaryCard eyebrow="Unread notifications" value={String(summary.unreadNotifications)} detail="Invite, approval, and release activity waiting for attention." accent={<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Inbox</span>} />
        <SummaryCard eyebrow="Released volume" value={formatUsd(summary.releasedUsd)} detail="Completed milestone releases recorded in the demo store." accent={<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Settled</span>} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Surface>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Recent projects</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Where the work stands today</h2>
            </div>
            <Link href="/dashboard/projects" className="text-sm font-semibold text-accent">See all</Link>
          </div>
          <div className="mt-6 space-y-4">
            {projects.map((project) => (
              <Link key={project.id} href={'/dashboard/projects/' + project.id} className="block rounded-3xl border border-line bg-slate-50 p-5 transition hover:border-brand/30 hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{project.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">
                    {project.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Surface>
        <Surface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Demo script</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Fast judge walkthrough</h2>
          <ol className="mt-6 space-y-4 text-sm text-slate-600">
            <li>1. Client creates and funds a milestone project.</li>
            <li>2. Provider submits a change order during scope creep.</li>
            <li>3. Client approves and escrow updates safely.</li>
            <li>4. Client releases a milestone and provider opens payout routing.</li>
            <li>5. Provider compares options and withdraws via Interswitch.</li>
          </ol>
        </Surface>
      </section>
    </div>
  );
}

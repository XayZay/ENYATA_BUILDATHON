import Link from 'next/link';

import { Surface } from '@/components/dashboard-shell';
import { SummaryCard } from '@/components/summary-card';
import { getViewerOrRedirect } from '@/lib/auth';
import { getDashboardSummary, getProviderDashboardSnapshot, getProviderProfile, listProjects } from '@/lib/data';
import { formatNgn, formatUsd } from '@/lib/utils';

export default async function DashboardPage() {
  const viewer = await getViewerOrRedirect();
  const [summary, projects] = await Promise.all([getDashboardSummary(viewer), listProjects(viewer)]);
  const recentProjects = projects.slice(0, 3);

  if (viewer.role === 'provider') {
    const [snapshot, providerProfile] = await Promise.all([
      getProviderDashboardSnapshot(viewer),
      getProviderProfile(viewer.userId)
    ]);

    return (
      <div className="space-y-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Provider home</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">See invites, delivery pressure, and today&apos;s FX context</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Your dashboard should help you decide what to work on and how much your released USD is worth in NGN right now.
            </p>
          </div>
          <Surface className="min-w-[280px] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Provider identity</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">@{providerProfile?.handle ?? 'complete-profile'}</p>
            <p className="mt-2 text-sm text-slate-500">Code: {providerProfile?.providerCode ?? 'Pending'}</p>
            <Link href="/auth/provider-profile" className="mt-4 inline-flex text-sm font-semibold text-accent">Edit profile</Link>
          </Surface>
        </section>
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard eyebrow="Current USD -> NGN" value={snapshot.currentRate.toLocaleString() + ' NGN'} detail={'Live source: ' + snapshot.rateSource} accent={<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live FX</span>} />
          <SummaryCard eyebrow="Best route today" value={snapshot.bestRouteLabel} detail={formatNgn(snapshot.bestRouteAmountNgn) + ' estimated outcome'} accent={<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Best value</span>} />
          <SummaryCard eyebrow="Awaiting funding" value={String(snapshot.awaitingFunding)} detail="Projects still waiting to move further into escrow." accent={<span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Pipeline</span>} />
          <SummaryCard eyebrow="Pending delivery" value={String(snapshot.pendingDeliveries)} detail="Funded milestones you still need to deliver or mark complete." accent={<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Action</span>} />
        </section>
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Surface>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Your projects</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">What needs attention first</h2>
              </div>
              <Link href="/dashboard/projects" className="text-sm font-semibold text-accent">See all</Link>
            </div>
            <div className="mt-6 space-y-4">
              {recentProjects.map((project) => (
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
              {recentProjects.length === 0 ? <p className="text-sm text-slate-500">No projects yet.</p> : null}
            </div>
          </Surface>
          <Surface>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Released balance</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">What is already available to route</h2>
            <p className="mt-6 text-5xl font-semibold tracking-tight text-ink">{formatUsd(snapshot.releasedUsd)}</p>
            <p className="mt-3 text-sm text-slate-500">Open any released project to compare routing options in detail.</p>
          </Surface>
        </section>
      </div>
    );
  }

  const draftProjects = projects.filter((project) => project.status === 'draft').length;
  const pendingApprovals = projects.flatMap((project) => project.changeOrders).filter((changeOrder) => changeOrder.status !== 'rejected' && changeOrder.status !== 'fully_approved').length;
  const readyForRelease = projects.flatMap((project) => project.milestones).filter((milestone) => milestone.status === 'funded' && milestone.deliveredAt).length;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Client home</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Manage protected projects and release work confidently</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Your dashboard should tell you what needs funding, what needs approval, and which milestones are ready for release.
          </p>
        </div>
        <Link href="/dashboard/projects/new" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
          Create project
        </Link>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard eyebrow="Draft projects" value={String(draftProjects)} detail="Projects still waiting for escrow funding." accent={<span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Draft</span>} />
        <SummaryCard eyebrow="Pending approvals" value={String(pendingApprovals)} detail="Change orders currently waiting for a decision." accent={<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Review</span>} />
        <SummaryCard eyebrow="Ready for release" value={String(readyForRelease)} detail="Delivered milestones you can now release to the provider." accent={<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Release</span>} />
        <SummaryCard eyebrow="Escrowed volume" value={formatUsd(summary.releasedUsd)} detail="Completed release volume recorded so far." accent={<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Volume</span>} />
      </section>
      <Surface>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Recent projects</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Where client action is needed</h2>
          </div>
          <Link href="/dashboard/projects" className="text-sm font-semibold text-accent">See all</Link>
        </div>
        <div className="mt-6 space-y-4">
          {recentProjects.map((project) => (
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
          {recentProjects.length === 0 ? <p className="text-sm text-slate-500">No projects yet.</p> : null}
        </div>
      </Surface>
    </div>
  );
}


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
        <section className="dashboard-grid">
          <Surface className="overflow-hidden border-blue-100 bg-[linear-gradient(135deg,#143abf_0%,#1f4fff_48%,#4e77ff_100%)] p-8 text-white shadow-[0_36px_100px_rgba(37,99,235,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">Provider dashboard</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Work the active pipeline and watch what released USD means in NGN today.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-blue-100">
              Your CrossRoute workspace shows the projects waiting for action, your searchable identity, and the live Interswitch settlement picture before you open a payout.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Current rate</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{snapshot.currentRate.toLocaleString()} NGN</p>
                <p className="mt-2 text-sm text-blue-100">Source: {snapshot.rateSource}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Settlement rail</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{snapshot.bestRouteLabel}</p>
                <p className="mt-2 text-sm text-blue-100">{formatNgn(snapshot.bestRouteAmountNgn)} estimated</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Identity</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">@{providerProfile?.handle ?? 'setup'}</p>
                <p className="mt-2 text-sm text-blue-100">{providerProfile?.providerCode ?? 'Complete profile to generate code'}</p>
              </div>
            </div>
          </Surface>

          <div className="space-y-6">
            <SummaryCard
              eyebrow="Awaiting funding"
              value={String(snapshot.awaitingFunding)}
              detail="Draft or funded projects that still need the client to move escrow forward."
              accent={<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">Pipeline</span>}
            />
            <SummaryCard
              eyebrow="Pending delivery"
              value={String(snapshot.pendingDeliveries)}
              detail="Funded milestones that still need a delivery update from you."
              accent={<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Action</span>}
            />
            <SummaryCard
              eyebrow="Released balance"
              value={formatUsd(snapshot.releasedUsd)}
              detail="Open any released project to view the Interswitch payout timing recommendation."
              accent={<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Ready</span>}
            />
          </div>
        </section>

        <section className="dashboard-grid">
          <Surface>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Project queue</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Where you should focus next</h2>
              </div>
              <Link href="/dashboard/projects" className="text-sm font-semibold text-blue-700">See all projects</Link>
            </div>
            <div className="mt-6 space-y-4">
              {recentProjects.map((project) => (
                <Link key={project.id} href={'/dashboard/projects/' + project.id} className="block rounded-[1.5rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 transition hover:border-blue-200 hover:shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-slate-950">{project.title}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{project.description}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">
                      {project.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span>{project.client.fullName}</span>
                    {project.providerProfile?.handle ? <span>@{project.providerProfile.handle}</span> : null}
                    <span>{project.milestones.length} milestones</span>
                  </div>
                </Link>
              ))}
              {recentProjects.length === 0 ? <p className="text-sm text-slate-500">No projects yet.</p> : null}
            </div>
          </Surface>

          <Surface className="border-blue-100 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Provider profile</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Make yourself easy to invite</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p><span className="font-semibold text-slate-950">Handle:</span> {providerProfile?.handle ? '@' + providerProfile.handle : 'Not set yet'}</p>
              <p><span className="font-semibold text-slate-950">Code:</span> {providerProfile?.providerCode ?? 'Not generated yet'}</p>
              <p><span className="font-semibold text-slate-950">Specialty:</span> {providerProfile?.specialty ?? 'Not set yet'}</p>
            </div>
            <Link href="/auth/provider-profile" className="mt-8 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent">
              Update provider profile
            </Link>
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
      <section className="dashboard-grid">
        <Surface className="overflow-hidden border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef5ff_100%)] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">Client dashboard</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Fund work safely, approve scope deliberately, and release only when the right outcome arrives.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600">
            This view is tuned for client control: what still needs funding, what change order is waiting on you, and which delivered milestone is ready to move into payout.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/dashboard/projects/new" className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.18)] transition hover:bg-accent">
              Create new project
            </Link>
            <Link href="/dashboard/projects" className="rounded-full border border-blue-100 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70">
              Review active projects
            </Link>
          </div>
        </Surface>

        <div className="space-y-6">
          <SummaryCard
            eyebrow="Draft projects"
            value={String(draftProjects)}
            detail="Projects still waiting for the client to fund escrow."
            accent={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Draft</span>}
          />
          <SummaryCard
            eyebrow="Pending approvals"
            value={String(pendingApprovals)}
            detail="Change orders currently waiting for a decision from your side."
            accent={<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Review</span>}
          />
          <SummaryCard
            eyebrow="Ready for release"
            value={String(readyForRelease)}
            detail="Delivered milestones that are waiting for a release decision."
            accent={<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Release</span>}
          />
        </div>
      </section>

      <section className="dashboard-grid">
        <Surface>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Recent project routes</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Where client action is needed</h2>
            </div>
            <Link href="/dashboard/projects" className="text-sm font-semibold text-blue-700">See all projects</Link>
          </div>
          <div className="mt-6 space-y-4">
            {recentProjects.map((project) => (
              <Link key={project.id} href={'/dashboard/projects/' + project.id} className="block rounded-[1.5rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 transition hover:border-blue-200 hover:shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">{project.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{project.description}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">
                    {project.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span>{project.provider.fullName}</span>
                  {project.providerProfile?.handle ? <span>@{project.providerProfile.handle}</span> : null}
                  <span>{formatUsd(project.totalAmountUsd)}</span>
                </div>
              </Link>
            ))}
            {recentProjects.length === 0 ? <p className="text-sm text-slate-500">No projects yet.</p> : null}
          </div>
        </Surface>

        <Surface className="border-blue-100 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Escrowed volume</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{formatUsd(summary.releasedUsd)}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This is the completed release volume recorded in the system so far. It gives you a quick sense of how much work has already moved safely through escrow.
          </p>
        </Surface>
      </section>
    </div>
  );
}


import { notFound } from 'next/navigation';

import { RoutingCard } from '@/components/routing-card';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';
import { getRoutingOptions, hydrateProject, listPayoutRequests } from '@/lib/data';
import { formatUsd } from '@/lib/utils';

export default async function PayoutPage({ params }: { params: { id: string } }) {
  const viewer = await getViewerOrRedirect();

  let project;
  try {
    project = await hydrateProject(params.id, viewer);
  } catch {
    notFound();
  }

  const [options, payoutRequests] = await Promise.all([
    getRoutingOptions(project.id, viewer),
    listPayoutRequests(project.id, viewer)
  ]);
  const releasedUsd = project.milestones.filter((entry) => entry.status === 'released').reduce((sum, milestone) => sum + milestone.amountUsd, 0);

  return (
    <div className="space-y-8">
      <section className="dashboard-grid">
        <Surface className="overflow-hidden border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef5ff_100%)] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">Payout route comparison</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Compare the strongest route for released funds before you withdraw.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            These estimates use live USD to NGN pricing from Monierate when available, with CrossRoute fee rules applied per platform.
          </p>
        </Surface>
        <Surface className="border-blue-100 bg-[linear-gradient(180deg,#143abf_0%,#1f4fff_100%)] p-8 text-white shadow-[0_32px_90px_rgba(37,99,235,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Released so far</p>
          <p className="mt-3 text-5xl font-semibold tracking-tight">{formatUsd(releasedUsd)}</p>
          <p className="mt-3 text-sm text-blue-100">Project: {project.title}</p>
        </Surface>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <RoutingCard key={option.platform} option={option} projectId={project.id} />
        ))}
      </section>

      <section className="dashboard-grid">
        <Surface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Optimization summary</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Read the tradeoffs before you choose.</h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            Wise, Grey, Payoneer, and Quidax values use live USD to NGN rate data plus the configured fee model. Interswitch execution remains visible here, but direct payout stays disabled until your account activation is complete.
          </p>
        </Surface>

        <Surface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payout log</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Recorded route decisions</h2>
          <div className="mt-6 space-y-4">
            {payoutRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No payout decisions logged yet.</p>
            ) : (
              payoutRequests.map((request) => (
                <div key={request.id} className="rounded-[1.4rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
                  <p className="text-lg font-semibold text-slate-950">{request.selectedPlatform}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{formatUsd(request.amountUsd)} request recorded with status {request.status}.</p>
                </div>
              ))
            )}
          </div>
        </Surface>
      </section>
    </div>
  );
}


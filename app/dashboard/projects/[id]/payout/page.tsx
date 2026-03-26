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
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Payout routing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Choose the best route for released funds</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            These estimates use live USD to NGN pricing from Monierate when available, with CrossRoute fee rules applied per platform.
          </p>
        </div>
        <Surface className="min-w-[260px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Released so far</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{formatUsd(releasedUsd)}</p>
          <p className="mt-2 text-sm text-slate-500">Project: {project.title}</p>
        </Surface>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <RoutingCard key={option.platform} option={option} projectId={project.id} />
        ))}
      </section>
      <Surface>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Disclosure</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Wise, Grey, Payoneer, and Quidax values use the live USD to NGN rate plus the configured fee model. Interswitch execution is disabled until account activation is complete.
        </p>
      </Surface>
      <Surface>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payout log</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Recorded route decisions</h2>
        <div className="mt-6 space-y-4">
          {payoutRequests.length === 0 ? (
            <p className="text-sm text-slate-500">No payout decisions logged yet.</p>
          ) : (
            payoutRequests.map((request) => (
              <div key={request.id} className="rounded-3xl border border-line bg-slate-50 p-5">
                <p className="text-lg font-semibold text-ink">{request.selectedPlatform}</p>
                <p className="mt-2 text-sm text-slate-600">{formatUsd(request.amountUsd)} request recorded with status {request.status}.</p>
              </div>
            ))
          )}
        </div>
      </Surface>
    </div>
  );
}

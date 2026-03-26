import { notFound } from 'next/navigation';

import { RoutingCard } from '@/components/routing-card';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';
import { getRoutingOptions, hydrateProject, listPayoutRequests } from '@/lib/mock-db';
import { formatNgn, formatUsd } from '@/lib/utils';

export default async function PayoutPage({ params }: { params: { id: string } }) {
  const viewer = await getViewerOrRedirect();

  let project;
  try {
    project = hydrateProject(params.id);
  } catch {
    notFound();
  }

  const options = getRoutingOptions(project.id, viewer);
  const payoutRequests = listPayoutRequests(project.id);
  const releasedUsd = project.milestones.filter((entry) => entry.status === 'released').reduce((sum, milestone) => sum + milestone.amountUsd, 0);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Payout routing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Choose the best route for released funds</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Compare Interswitch with Monierate-sourced platform benchmarks and decide what maximizes the provider&apos;s NGN outcome.
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
          Rates for Wise, Grey, Payoneer, and Quidax are sourced from Monierate and are indicative only. CrossRoute is not liable for discrepancies at time of transfer. Interswitch rates are processed directly.
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
                <p className="mt-2 text-sm text-slate-600">{formatNgn(request.amountNgn)} at {request.rateAtTimeNgn.toLocaleString()} NGN per USD.</p>
              </div>
            ))
          )}
        </div>
      </Surface>
    </div>
  );
}


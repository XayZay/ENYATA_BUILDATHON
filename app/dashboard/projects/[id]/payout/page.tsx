import { notFound } from 'next/navigation';

import { RoutingCard } from '@/components/routing-card';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';
import { getRoutingOptions, hydrateProject, listPayoutRequests } from '@/lib/data';
import { buildPayoutTimingInsight } from '@/lib/monierate';
import { formatNgn, formatUsd } from '@/lib/utils';

function formatPercent(value: number) {
  const prefix = value > 0 ? '+' : '';
  return prefix + value.toFixed(2) + '%';
}

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
  const interswitchRequests = payoutRequests.filter((request) => request.selectedPlatform === 'interswitch');
  const releasedUsd = project.milestones.filter((entry) => entry.status === 'released').reduce((sum, milestone) => sum + milestone.amountUsd, 0);
  const interswitchOption = options.find((option) => option.platform === 'interswitch');

  if (!interswitchOption) {
    notFound();
  }

  const timingInsight = await buildPayoutTimingInsight(interswitchOption);

  return (
    <div className="space-y-8">
      <section className="dashboard-grid">
        <Surface className="overflow-hidden border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef5ff_100%)] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">Payout timing intelligence</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Decide whether to settle now or wait for a stronger USD to NGN window.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            CrossRoute uses live USD to NGN pricing and recent Monierate momentum to suggest whether you should hold a little longer or settle through Interswitch now.
          </p>
        </Surface>
        <Surface className="border-blue-100 bg-[linear-gradient(180deg,#143abf_0%,#1f4fff_100%)] p-8 text-white shadow-[0_32px_90px_rgba(37,99,235,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Released so far</p>
          <p className="mt-3 text-5xl font-semibold tracking-tight">{formatUsd(releasedUsd)}</p>
          <p className="mt-3 text-sm text-blue-100">Project: {project.title}</p>
        </Surface>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <RoutingCard option={interswitchOption} projectId={project.id} emphasis="primary" />

        <Surface className="border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Timing signal</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{timingInsight.headline}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{timingInsight.summary}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                timingInsight.recommendation === 'hold' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {timingInsight.recommendation === 'hold' ? 'Recommend hold' : 'Recommend transfer now'}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {timingInsight.signalLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {timingInsight.confidence} confidence
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">If you settle now</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{formatNgn(timingInsight.estimatedNowAmountNgn)}</p>
            </div>
            <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Projected short-term outcome</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{formatNgn(timingInsight.projectedAmountNgn)}</p>
              <p className="mt-2 text-sm text-slate-500">
                Difference: {formatNgn(timingInsight.projectedDifferenceNgn)} over the next few days if recent momentum continues.
              </p>
            </div>
          </div>
        </Surface>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Surface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Live USD to NGN</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{timingInsight.latestRate.toLocaleString()} NGN</p>
          <p className="mt-3 text-sm text-slate-500">Current pricing signal from {timingInsight.source === 'monierate' ? 'Monierate' : 'fallback FX'}.</p>
        </Surface>
        <Surface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">7 day move</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{formatPercent(timingInsight.sevenDayChangePercent)}</p>
          <p className="mt-3 text-sm text-slate-500">Positive means USD has been strengthening against naira recently.</p>
        </Surface>
        <Surface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Trailing average</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{timingInsight.trailingAverageRate.toLocaleString()} NGN</p>
          <p className="mt-3 text-sm text-slate-500">Used to compare the current rate against the recent baseline.</p>
        </Surface>
        <Surface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">3 day bias</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{formatPercent(timingInsight.threeDayProjectionPercent)}</p>
          <p className="mt-3 text-sm text-slate-500">{timingInsight.note}</p>
        </Surface>
      </section>

      <section>
        <Surface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payout log</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Recorded Interswitch settlement requests</h2>
          <div className="mt-6 space-y-4">
            {interswitchRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No Interswitch settlement requests recorded yet.</p>
            ) : (
              interswitchRequests.map((request) => (
                <div key={request.id} className="rounded-[1.4rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
                  <p className="text-lg font-semibold capitalize text-slate-950">{request.selectedPlatform}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {formatUsd(request.amountUsd)} request recorded with status {request.status}.
                  </p>
                </div>
              ))
            )}
          </div>
        </Surface>
      </section>
    </div>
  );
}

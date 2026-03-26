import Link from 'next/link';
import { notFound } from 'next/navigation';

import { fundProjectAction } from '@/app/actions';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';
import { hydrateProject } from '@/lib/data';
import { isInterswitchConfigured } from '@/lib/env';
import { formatUsd } from '@/lib/utils';

export default async function FundProjectPage({ params }: { params: { id: string } }) {
  const viewer = await getViewerOrRedirect();

  let project;
  try {
    project = await hydrateProject(params.id, viewer);
  } catch {
    notFound();
  }

  const paymentsReady = isInterswitchConfigured();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Surface>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Funding</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Lock the escrow before work begins</h1>
        <p className="mt-4 text-slate-600">
          This flow is wired for real payment execution, but actual deposit initiation is currently blocked until your Interswitch account activation is complete.
        </p>
        <div className="mt-8 rounded-[1.5rem] border border-line bg-slate-50 p-6">
          <p className="text-sm text-slate-500">Project total</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-ink">{formatUsd(project.totalAmountUsd)}</p>
          <p className="mt-3 text-sm text-slate-500">Milestones: {project.milestones.length}</p>
        </div>
        <form action={fundProjectAction} className="mt-8">
          <input type="hidden" name="projectId" value={project.id} />
          <button disabled={!paymentsReady} className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-600">
            {paymentsReady ? 'Initiate Interswitch deposit' : 'Funding unavailable until Interswitch activation'}
          </button>
        </form>
      </Surface>
      <Surface>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current status</p>
        <ol className="mt-6 space-y-4 text-sm text-slate-600">
          <li>1. The database is live and ready to record real deposit references.</li>
          <li>2. The UI is prepared to call Interswitch once credentials are available.</li>
          <li>3. Until then, projects remain in draft because CrossRoute should not fake escrow funding.</li>
        </ol>
        <Link href={'/dashboard/projects/' + project.id} className="mt-8 inline-flex rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50">
          Back to project
        </Link>
      </Surface>
    </div>
  );
}

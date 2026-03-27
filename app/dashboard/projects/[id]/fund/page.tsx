import Link from 'next/link';
import { notFound } from 'next/navigation';

import { fundProjectAction } from '@/app/actions';
import { PendingSubmitButton } from '@/components/pending-submit-button';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';
import { hydrateProject } from '@/lib/data';
import { formatUsd } from '@/lib/utils';

export default async function FundProjectPage({ params }: { params: { id: string } }) {
  const viewer = await getViewerOrRedirect();

  let project;
  try {
    project = await hydrateProject(params.id, viewer);
  } catch {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Surface className="overflow-hidden border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef5ff_100%)] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Funding</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Lock the escrow before work begins.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          This flow now uses a demo Interswitch funding step so the escrow journey works end to end before live keys are added.
        </p>
        <div className="mt-8 rounded-[1.5rem] border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Project total</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-slate-950">{formatUsd(project.totalAmountUsd)}</p>
          <p className="mt-3 text-sm text-slate-500">Milestones: {project.milestones.length}</p>
        </div>
        <form action={fundProjectAction} className="mt-8">
          <input type="hidden" name="projectId" value={project.id} />
          <PendingSubmitButton
            pendingLabel="Starting deposit..."
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent disabled:bg-slate-300 disabled:text-slate-600"
          >
            Run demo Interswitch deposit
          </PendingSubmitButton>
        </form>
      </Surface>
      <Surface>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current status</p>
        <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
          <li>1. The database stores a demo Interswitch reference for this deposit.</li>
          <li>2. All pending milestones move into funded escrow immediately after the demo deposit succeeds.</li>
          <li>3. You can swap this flow to live Interswitch credentials later without changing the product journey.</li>
        </ol>
        <Link href={'/dashboard/projects/' + project.id} className="mt-8 inline-flex rounded-full border border-blue-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70">
          Back to project
        </Link>
      </Surface>
    </div>
  );
}

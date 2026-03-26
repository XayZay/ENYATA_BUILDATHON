import Link from 'next/link';
import { notFound } from 'next/navigation';

import { fundProjectAction } from '@/app/actions';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';
import { hydrateProject } from '@/lib/mock-db';
import { formatUsd } from '@/lib/utils';

export default async function FundProjectPage({ params }: { params: { id: string } }) {
  await getViewerOrRedirect();

  let project;
  try {
    project = hydrateProject(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Surface>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Funding</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Lock the escrow before work begins</h1>
        <p className="mt-4 text-slate-600">
          In the real integration this is where the Interswitch sandbox deposit would be initiated. For now, the demo action simulates a successful deposit and marks all milestones as funded.
        </p>
        <div className="mt-8 rounded-[1.5rem] border border-line bg-slate-50 p-6">
          <p className="text-sm text-slate-500">Project total</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-ink">{formatUsd(project.totalAmountUsd)}</p>
          <p className="mt-3 text-sm text-slate-500">Milestones: {project.milestones.length}</p>
        </div>
        <form action={fundProjectAction} className="mt-8">
          <input type="hidden" name="projectId" value={project.id} />
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
            Simulate Interswitch deposit
          </button>
        </form>
      </Surface>
      <Surface>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">What happens next</p>
        <ol className="mt-6 space-y-4 text-sm text-slate-600">
          <li>1. Milestones move from pending to funded.</li>
          <li>2. Project status flips from draft to funded.</li>
          <li>3. A deposit transaction is recorded with an Interswitch reference.</li>
          <li>4. The provider receives a project-funded notification.</li>
        </ol>
        <Link href={'/dashboard/projects/' + project.id} className="mt-8 inline-flex rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50">
          Back to project
        </Link>
      </Surface>
    </div>
  );
}

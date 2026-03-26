import Link from 'next/link';

import { StatusBadge } from '@/components/status-badge';
import { Surface } from '@/components/dashboard-shell';
import type { ProjectDetail, Role } from '@/lib/types';
import { formatUsd } from '@/lib/utils';

export function ProjectCard({ project, role }: { project: ProjectDetail; role: Role }) {
  return (
    <Surface className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {role === 'client' ? 'Provider' : 'Client'}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{project.title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{project.description}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p className="font-medium text-ink">Escrow total</p>
          <p>{formatUsd(project.totalAmountUsd)}</p>
        </div>
        <div>
          <p className="font-medium text-ink">Milestones</p>
          <p>{project.milestones.length} mapped deliverables</p>
        </div>
        <div>
          <p className="font-medium text-ink">Open changes</p>
          <p>{project.changeOrders.filter((entry) => entry.status !== 'rejected' && entry.status !== 'fully_approved').length} active</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href={'/dashboard/projects/' + project.id} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
          Open project
        </Link>
        {role === 'client' && project.status === 'draft' ? (
          <Link href={'/dashboard/projects/' + project.id + '/fund'} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50">
            Fund escrow
          </Link>
        ) : null}
        {role === 'provider' ? (
          <Link href={'/dashboard/projects/' + project.id + '/payout'} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50">
            View payout routing
          </Link>
        ) : null}
      </div>
    </Surface>
  );
}

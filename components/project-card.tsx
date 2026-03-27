import { LoadingLink } from '@/components/loading-link';
import { StatusBadge } from '@/components/status-badge';
import { Surface } from '@/components/dashboard-shell';
import type { ProjectDetail, Role } from '@/lib/types';
import { formatUsd } from '@/lib/utils';

export function ProjectCard({ project, role }: { project: ProjectDetail; role: Role }) {
  const counterpart = role === 'client' ? project.provider : project.client;

  return (
    <Surface className="overflow-hidden border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {role === 'client' ? 'Provider' : 'Client'}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{project.title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{project.description}</p>
          <p className="mt-4 text-sm font-medium text-blue-700">
            {counterpart.fullName}
            {project.providerProfile?.handle ? ' / @' + project.providerProfile.handle : ''}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="mt-6 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
        <div className="rounded-[1.25rem] border border-blue-100 bg-white px-4 py-4 shadow-sm">
          <p className="font-medium text-slate-950">Escrow total</p>
          <p className="mt-1">{formatUsd(project.totalAmountUsd)}</p>
        </div>
        <div className="rounded-[1.25rem] border border-blue-100 bg-white px-4 py-4 shadow-sm">
          <p className="font-medium text-slate-950">Milestones</p>
          <p className="mt-1">{project.milestones.length} mapped deliverables</p>
        </div>
        <div className="rounded-[1.25rem] border border-blue-100 bg-white px-4 py-4 shadow-sm">
          <p className="font-medium text-slate-950">Open changes</p>
          <p className="mt-1">{project.changeOrders.filter((entry) => entry.status !== 'rejected' && entry.status !== 'fully_approved').length} active</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <LoadingLink
          href={'/dashboard/projects/' + project.id}
          pendingLabel="Opening project..."
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-80"
        >
          Open project
        </LoadingLink>
        {role === 'client' && project.milestones.some((milestone) => milestone.status === 'pending') ? (
          <LoadingLink
            href={'/dashboard/projects/' + project.id + '/fund'}
            pendingLabel="Opening funding..."
            className="rounded-full border border-blue-100 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70 disabled:cursor-not-allowed disabled:opacity-80"
          >
            Fund escrow
          </LoadingLink>
        ) : null}
        {role === 'provider' ? (
          <LoadingLink
            href={'/dashboard/projects/' + project.id + '/payout'}
            pendingLabel="Opening payout..."
            className="rounded-full border border-blue-100 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70 disabled:cursor-not-allowed disabled:opacity-80"
          >
            View payout timing
          </LoadingLink>
        ) : null}
      </div>
    </Surface>
  );
}

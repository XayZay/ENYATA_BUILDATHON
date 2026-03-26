import { StatusBadge } from '@/components/status-badge';
import type { Milestone } from '@/lib/types';
import { formatDate, formatUsd } from '@/lib/utils';

export function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <div key={milestone.id} className="rounded-[1.6rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Milestone {milestone.orderIndex}</p>
              <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{milestone.title}</h4>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{milestone.description}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={milestone.status} />
              <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{formatUsd(milestone.amountUsd)}</p>
              <p className="text-sm text-slate-500">Due {formatDate(milestone.dueDate)}</p>
            </div>
          </div>
          <div className="mt-5 h-1.5 rounded-full bg-blue-50">
            <div className={`h-1.5 rounded-full ${milestone.status === 'released' ? 'w-full bg-emerald-500' : milestone.deliveredAt ? 'w-4/5 bg-blue-500' : milestone.status === 'funded' ? 'w-2/5 bg-blue-300' : 'w-1/5 bg-slate-300'}`} />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {milestone.deliveredAt ? 'Provider marked this milestone delivered and it is ready for client review.' : 'Awaiting provider delivery update.'}
          </p>
        </div>
      ))}
    </div>
  );
}


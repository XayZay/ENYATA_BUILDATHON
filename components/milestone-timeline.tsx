import { StatusBadge } from '@/components/status-badge';
import type { Milestone } from '@/lib/types';
import { formatDate, formatUsd } from '@/lib/utils';

export function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <div key={milestone.id} className="rounded-3xl border border-line bg-slate-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Milestone {milestone.orderIndex}</p>
              <h4 className="mt-2 text-lg font-semibold text-ink">{milestone.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{milestone.description}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={milestone.status} />
              <p className="mt-3 text-lg font-semibold text-ink">{formatUsd(milestone.amountUsd)}</p>
              <p className="text-sm text-slate-500">Due {formatDate(milestone.dueDate)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {milestone.deliveredAt ? 'Provider marked this milestone delivered.' : 'Awaiting provider delivery update.'}
          </p>
        </div>
      ))}
    </div>
  );
}

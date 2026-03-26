import { cn } from '@/lib/utils';
import type { ChangeOrderStatus, MilestoneStatus, ProjectStatus } from '@/lib/types';

const toneMap: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  funded: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-cyan-50 text-cyan-700',
  change_requested: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-700',
  disputed: 'bg-rose-50 text-rose-700',
  pending: 'bg-slate-100 text-slate-700',
  released: 'bg-emerald-50 text-emerald-700',
  approved_client: 'bg-blue-50 text-blue-700',
  approved_provider: 'bg-indigo-50 text-indigo-700',
  fully_approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700'
};

export function StatusBadge({ status }: { status: ProjectStatus | MilestoneStatus | ChangeOrderStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-wide', toneMap[status])}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}


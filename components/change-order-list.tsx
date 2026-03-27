import { Surface } from '@/components/dashboard-shell';
import { StatusBadge } from '@/components/status-badge';
import type { ChangeOrder } from '@/lib/types';
import { formatUsd, formatRelative } from '@/lib/utils';

export function ChangeOrderList({ changeOrders }: { changeOrders: ChangeOrder[] }) {
  if (changeOrders.length === 0) {
    return <Surface><p className="text-sm text-slate-500">No change orders yet. Scope shifts will appear here as an audit trail.</p></Surface>;
  }

  return (
    <div className="space-y-4">
      {changeOrders.map((changeOrder) => (
        <Surface key={changeOrder.id} className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Change order</p>
              <p className="mt-2 text-lg font-semibold text-ink">{formatUsd(changeOrder.originalAmountUsd)} to {formatUsd(changeOrder.newAmountUsd)}</p>
              <p className="mt-2 text-sm text-slate-600">{changeOrder.reason}</p>
            </div>
            <StatusBadge status={changeOrder.status} />
          </div>
          <p className="text-sm text-slate-500">Submitted {formatRelative(changeOrder.createdAt)}</p>
        </Surface>
      ))}
    </div>
  );
}

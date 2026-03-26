import { requestPayoutAction } from '@/app/actions';
import { Surface } from '@/components/dashboard-shell';
import type { RoutingOption } from '@/lib/types';
import { formatNgn, formatUsd } from '@/lib/utils';

export function RoutingCard({ option, projectId }: { option: RoutingOption; projectId: string }) {
  return (
    <Surface className="flex h-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{option.source}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{option.label}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          {option.isBestValue ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Best Value</span> : null}
          {option.isRecommended ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Recommended by Interswitch</span> : null}
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-500">Current USD to NGN rate</p>
        <p className="mt-1 text-2xl font-semibold text-ink">{option.rate.toLocaleString()} NGN</p>
      </div>
      <div>
        <p className="text-sm text-slate-500">You receive</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-ink">{formatNgn(option.amountNgn)}</p>
        <p className="mt-2 text-sm text-slate-500">On {formatUsd(option.amountUsd)} after {option.feeLabel} in fees.</p>
      </div>
      <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
        <p>Processing time: {option.processingTime}</p>
        <p className="mt-2">{option.note}</p>
      </div>
      <form action={requestPayoutAction} className="mt-auto">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="platform" value={option.platform} />
        <button disabled={!option.isAvailable} className="w-full rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-600">
          {option.platform === 'interswitch' ? 'Withdraw via Interswitch' : 'Log ' + option.label + ' preference'}
        </button>
      </form>
    </Surface>
  );
}

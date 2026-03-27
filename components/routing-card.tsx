import { requestPayoutAction } from '@/app/actions';
import { Surface } from '@/components/dashboard-shell';
import { PendingSubmitButton } from '@/components/pending-submit-button';
import type { RoutingOption } from '@/lib/types';
import { formatNgn, formatUsd } from '@/lib/utils';

type RoutingCardProps = {
  option: RoutingOption;
  projectId: string;
  emphasis?: 'primary' | 'secondary';
};

export function RoutingCard({ option, projectId, emphasis = 'secondary' }: RoutingCardProps) {
  const isPrimary = emphasis === 'primary';

  return (
    <Surface
      className={`flex h-full flex-col gap-6 border-blue-100 ${
        isPrimary
          ? 'bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_100%)] shadow-[0_32px_90px_rgba(37,99,235,0.12)]'
          : 'bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isPrimary ? 'text-blue-700' : 'text-slate-500'}`}>
            {isPrimary ? 'Primary settlement rail' : 'Comparison route'}
          </p>
          <h3 className={`mt-3 font-semibold tracking-tight ${isPrimary ? 'text-4xl text-slate-950 sm:text-5xl' : 'text-3xl text-slate-950'}`}>
            {option.label}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{option.note}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {option.isBestValue ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Best value
            </span>
          ) : null}
          {option.isRecommended ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Powered by Interswitch
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-blue-100 bg-white/95 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Estimated NGN amount</p>
        <p className={`mt-3 font-semibold tracking-tight ${isPrimary ? 'text-5xl text-slate-950 sm:text-6xl' : 'text-5xl text-slate-950'}`}>
          {formatNgn(option.amountNgn)}
        </p>
        <p className="mt-3 text-sm text-slate-500">On {formatUsd(option.amountUsd)} after {option.feeLabel} in fees.</p>
      </div>

      <div className={`grid gap-4 ${isPrimary ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <div className="rounded-[1.25rem] border border-blue-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Rate</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{option.rate.toLocaleString()} NGN</p>
        </div>
        <div className="rounded-[1.25rem] border border-blue-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Time</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{option.processingTime}</p>
        </div>
        {isPrimary ? (
          <div className="rounded-[1.25rem] border border-blue-100 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Role</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Native payout rail</p>
          </div>
        ) : null}
      </div>

      {option.platform === 'interswitch' ? (
        <form action={requestPayoutAction} className="mt-auto">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="platform" value={option.platform} />
          <PendingSubmitButton
            disabled={!option.isAvailable}
            pendingLabel="Starting payout..."
            className="w-full rounded-full bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.18)] transition hover:bg-accent disabled:bg-slate-300 disabled:text-slate-600"
          >
            Withdraw via Interswitch
          </PendingSubmitButton>
        </form>
      ) : (
        <div className="mt-auto rounded-[1.25rem] border border-dashed border-blue-200 bg-blue-50/60 px-4 py-4 text-slate-600">
          <p className="text-sm font-medium">{option.label} is shown here as a benchmark route only.</p>
          <p className="mt-2 text-sm leading-7">CrossRoute does not initiate settlement through this provider from inside the product.</p>
        </div>
      )}
    </Surface>
  );
}

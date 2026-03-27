import type { ReactNode } from 'react';

import { Surface } from '@/components/dashboard-shell';

export function SummaryCard({ eyebrow, value, detail, accent }: { eyebrow: string; value: string; detail: string; accent: ReactNode }) {
  return (
    <Surface className="relative overflow-hidden border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)]">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-100/40 blur-2xl" />
      <div className="relative flex min-h-[188px] flex-col justify-between gap-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
          {accent}
        </div>
        <div>
          <p className="text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500">{detail}</p>
        </div>
      </div>
    </Surface>
  );
}


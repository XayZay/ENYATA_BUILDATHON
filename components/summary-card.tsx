import type { ReactNode } from 'react';

import { Surface } from '@/components/dashboard-shell';

export function SummaryCard({ eyebrow, value, detail, accent }: { eyebrow: string; value: string; detail: string; accent: ReactNode }) {
  return (
    <Surface className="flex min-h-[172px] flex-col justify-between gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
        {accent}
      </div>
      <div>
        <p className="text-4xl font-semibold tracking-tight text-ink">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{detail}</p>
      </div>
    </Surface>
  );
}

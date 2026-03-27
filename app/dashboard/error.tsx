'use client';

import Link from 'next/link';

type DashboardErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardErrorPage({ error, reset }: DashboardErrorPageProps) {
  return (
    <main className="min-h-[60vh] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-blue-100 bg-white p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Dashboard error</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Something went wrong in your workspace.</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          We could not finish this dashboard action. You can try again or head back to the main dashboard safely.
        </p>
        <p className="mt-4 rounded-[1.2rem] bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {error.message || 'Unexpected dashboard error'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-full border border-blue-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

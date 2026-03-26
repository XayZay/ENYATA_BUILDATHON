import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mist text-ink">
      <section className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand">
              Interswitch x Enyata Hackathon MVP
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
              Escrow that adapts. Payments that optimize.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CrossRoute protects international client-provider work with milestone escrow, dynamic change orders, and an NGN routing dashboard that helps Nigerian providers maximize payouts.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/auth/signup" className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                Start the demo
              </Link>
              <Link href="/dashboard" className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white">
                View dashboard
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-line bg-white p-8 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Agreement Shield</p>
                <p className="mt-3 text-2xl font-semibold text-ink">6-state escrow engine</p>
                <p className="mt-3 text-sm text-slate-600">Draft to funded to in progress, with scope changes and disputes handled in-product.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Routing IQ</p>
                <p className="mt-3 text-2xl font-semibold text-ink">Live NGN payout comparisons</p>
                <p className="mt-3 text-sm text-slate-600">Compare Monierate-sourced options and execute through Interswitch when ready.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Built for the Nigeria to World corridor</p>
                <p className="mt-3 text-lg leading-7 text-slate-600">
                  International clients fund work in USD. Nigerian providers stay protected during scope changes, then choose the best route for converting released funds into NGN.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

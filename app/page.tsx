import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mist text-ink">
      <section className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand">
              Interswitch x Enyata Hackathon MVP
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
              Escrow that adapts. Payments that optimize.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CrossRoute protects global client-provider work with milestone escrow, dynamic change orders, provider identity, and an NGN routing layer built for the Nigeria to world corridor.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link href="/auth/signup?role=client" className="rounded-[1.5rem] border border-line bg-white p-6 shadow-soft transition hover:border-brand/30 hover:bg-brand/5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">I am a Client</p>
                <h2 className="mt-3 text-2xl font-semibold text-ink">Fund work with protected milestones</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">Create escrow-backed projects, invite providers, approve changes, and release funds only when work is delivered.</p>
              </Link>
              <Link href="/auth/signup?role=provider" className="rounded-[1.5rem] border border-line bg-white p-6 shadow-soft transition hover:border-brand/30 hover:bg-brand/5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">I am a Provider</p>
                <h2 className="mt-3 text-2xl font-semibold text-ink">Get discovered and maximize NGN payout</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">Create a public profile, receive project invites, handle scope changes safely, and track the best FX route.</p>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/auth/login" className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white">
                Login
              </Link>
              <Link href="/dashboard" className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white">
                Open dashboard
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-line bg-white p-8 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Provider Identity</p>
                <p className="mt-3 text-2xl font-semibold text-ink">Handle-based discovery</p>
                <p className="mt-3 text-sm text-slate-600">Providers can be invited by email, handle, or provider code instead of coordinating outside the product.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Routing IQ</p>
                <p className="mt-3 text-2xl font-semibold text-ink">Live FX visibility</p>
                <p className="mt-3 text-sm text-slate-600">Providers see current USD to NGN context on their dashboard before they even reach the payout screen.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Built for the Nigeria to World corridor</p>
                <p className="mt-3 text-lg leading-7 text-slate-600">
                  International clients fund work in USD. Nigerian providers stay protected during delivery and scope changes, then optimize what they receive in NGN.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

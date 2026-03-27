import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mist text-ink">
      <section className="mx-auto max-w-[1500px] px-6 py-8">
        <header className="glass-panel flex flex-col lg:flex-row flex-wrap lg:items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-accent">CrossRoute</p>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Global freelance escrow infrastructure</p>
          </div>
          <nav className="flex items-center -ml-4   gap-3 text-sm text-slate-600">
            <Link href="#roles" className=" rounded-full px-4 py-2 transition hover:bg-blue-50 hover:text-blue-700">Roles</Link>
            <Link href="/auth/login" className="rounded-full px-4 py-2 transition hover:bg-blue-50 hover:text-blue-700">Login</Link>
            <Link href="/auth/signup?role=client" className="rounded-full bg-brand px-5 py-2.5 font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.24)] transition hover:bg-accent">Get Started</Link>
          </nav>
        </header>

        <div className="grid gap-8 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              Built for Dollar to Naira Payments
            </p>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-6xl">
              Protect global freelance work with dynamic escrow and smarter FX routing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CrossRoute helps international clients fund projects safely in USD while Nigerian providers manage scope changes and compare live payout routes in NGN when the work is released.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/auth/signup?role=client" className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.24)] transition hover:bg-accent">
                Create Client Account
              </Link>
              <Link href="/auth/signup?role=provider" className="rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-200 hover:bg-blue-50/60">
                Join as Provider
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-blue-100 bg-white px-5 py-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Escrow</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">6</p>
                <p className="mt-2 text-sm text-slate-600">Tracked project states across funding, delivery, change orders, and disputes.</p>
              </div>
              <div className="rounded-[1.5rem] border border-blue-100 bg-white px-5 py-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Routing</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">5</p>
                <p className="mt-2 text-sm text-slate-600">Provider payout routes compared live for the USD to NGN corridor.</p>
              </div>
              <div className="rounded-[1.5rem] border border-blue-100 bg-white px-5 py-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Identity</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">@handle</p>
                <p className="mt-2 text-sm text-slate-600">Clients can find providers inside the product instead of coordinating outside it.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="bg-[linear-gradient(180deg,#0d2a9f_0%,#1f4fff_100%)] px-8 py-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">Provider payout view</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight">Live route intelligence when funds are released.</h2>
                <p className="mt-4 text-sm leading-7 text-blue-100">
                  Providers see current USD to NGN context, best value route, and a direct record of the payout option they selected.
                </p>
                <div className="mt-10 rounded-[1.6rem] bg-white/12 p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Current best route</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight">Wise</p>
                  <p className="mt-2 text-sm text-blue-100">Estimated ?1.48M on a released $1,200 milestone set.</p>
                </div>
              </div>
              <div className="space-y-4 bg-white px-6 py-6">
                <div className="rounded-[1.4rem] border border-blue-100 bg-[#f7faff] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Client workspace</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Fund milestones, approve scope, release with confidence.</p>
                </div>
                <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Change order engine</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">Scope changes stay inside the payment layer.</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Dual approval keeps an audit trail from the first request through the final release decision.</p>
                </div>
                <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Provider identity</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">Search by email, handle, code, or specialty.</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">CrossRoute connects clients and providers inside the product before money starts moving.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="roles" className="grid gap-6 py-8 lg:grid-cols-2">
          <Link href="/auth/signup?role=client" className="glass-panel block p-8 transition hover:-translate-y-0.5 hover:border-blue-100">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Client account</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Manage protected projects without losing control of releases.</h3>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Create projects, break funding into milestones, approve change orders, and release funds only when the provider has delivered the right work.
            </p>
            <span className="mt-8 inline-flex text-sm font-semibold text-blue-700">Create client account ?</span>
          </Link>
          <Link href="/auth/signup?role=provider" className="glass-panel block p-8 transition hover:-translate-y-0.5 hover:border-blue-100">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Provider account</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Get discovered and optimize what your released USD becomes in NGN.</h3>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Complete a provider profile, receive invites through your handle or provider code, and compare payout routes from your dashboard before you withdraw.
            </p>
            <span className="mt-8 inline-flex text-sm font-semibold text-blue-700">Join as provider ?</span>
          </Link>
        </section>

        <section id="product" className="glass-panel mt-6 overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-3">
            <div className="border-b border-blue-100 px-6 py-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step 1</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Create the agreement</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">The client creates a project, selects the provider inside CrossRoute, and defines milestone-based escrow terms.</p>
            </div>
            <div className="border-b border-blue-100 px-6 py-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step 2</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Adapt to change</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">If scope changes, the project moves into a tracked change-order flow instead of falling apart in chats and spreadsheets.</p>
            </div>
            <div className="px-6 py-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step 3</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Optimize the payout</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">When funds are released, the provider compares live routing options and chooses the strongest NGN outcome.</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}


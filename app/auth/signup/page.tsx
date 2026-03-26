import Link from 'next/link';

import { signupAction } from '@/app/actions';

export default function SignupPage({ searchParams }: { searchParams?: { error?: string; role?: string } }) {
  const selectedRole = searchParams?.role === 'client' ? 'client' : 'provider';

  return (
    <main className="min-h-screen bg-mist px-6 py-8 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1450px] overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0f2da5_0%,#1f4fff_100%)] px-8 py-10 text-white lg:px-12 lg:py-14">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <Link href="/" className="text-3xl font-semibold tracking-tight text-white">CrossRoute</Link>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">Role-first onboarding</p>
              <h1 className="mt-16 max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight">
                {selectedRole === 'provider'
                  ? 'Create the provider identity clients will actually use to find you.'
                  : 'Create the client workspace that funds, approves, and releases work safely.'}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-blue-100">
                {selectedRole === 'provider'
                  ? 'Providers sign up first, then complete a searchable profile with a handle, provider code, specialty, and payout preferences.'
                  : 'Clients sign up first, then create projects by selecting providers inside CrossRoute with milestone-based funding terms.'}
              </p>
            </div>
            <div className="rounded-[1.7rem] border border-white/20 bg-white/12 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Account type</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/auth/signup?role=client" className={`rounded-[1.3rem] border px-4 py-4 text-sm font-semibold transition ${selectedRole === 'client' ? 'border-white bg-white text-blue-700' : 'border-white/20 bg-white/10 text-white hover:bg-white/15'}`}>
                  Client
                </Link>
                <Link href="/auth/signup?role=provider" className={`rounded-[1.3rem] border px-4 py-4 text-sm font-semibold transition ${selectedRole === 'provider' ? 'border-white bg-white text-blue-700' : 'border-white/20 bg-white/10 text-white hover:bg-white/15'}`}>
                  Provider
                </Link>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_32%)]" />
        </section>

        <section className="flex items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-10 lg:px-12">
          <div className="w-full max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">{selectedRole === 'provider' ? 'Provider setup' : 'Client setup'}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Create your {selectedRole === 'provider' ? 'provider' : 'client'} account
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              {selectedRole === 'provider'
                ? 'Once your account is created, you will complete a provider profile before entering the dashboard.'
                : 'Once your account is created, you can start building protected projects and inviting providers.'}
            </p>
            {searchParams?.error ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{searchParams.error}</p> : null}
            <form action={signupAction} className="mt-8 space-y-5">
              <div>
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" placeholder={selectedRole === 'provider' ? 'Tunde Afolayan' : 'Adaeze Okafor'} required />
              </div>
              <div>
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" placeholder={selectedRole === 'provider' ? 'provider@example.com' : 'client@example.com'} required />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Create a secure password" minLength={8} required />
              </div>
              <div>
                <label htmlFor="role">Account type</label>
                <select id="role" name="role" defaultValue={selectedRole}>
                  <option value="provider">Provider</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <button className="w-full rounded-full bg-brand px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)] transition hover:bg-accent">
                Create account
              </button>
            </form>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>Already have access?</span>
              <Link href="/auth/login" className="font-semibold text-blue-700">Sign in</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


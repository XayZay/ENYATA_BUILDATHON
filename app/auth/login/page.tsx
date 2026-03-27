import Link from 'next/link';

import { loginAction } from '@/app/actions';
import { PendingSubmitButton } from '@/components/pending-submit-button';

export default function LoginPage({ searchParams }: { searchParams?: { error?: string; message?: string } }) {
  return (
    <main className="min-h-screen bg-mist px-6 py-8 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1450px] overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft lg:grid-cols-[0.96fr_1.04fr]">
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0f2da5_0%,#1f4fff_100%)] px-8 py-10 text-white lg:px-12 lg:py-14">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <Link href="/" className="text-3xl font-semibold tracking-tight text-white">CrossRoute</Link>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">Secure freelance payments</p>
              <h1 className="mt-16 max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight">
                Sign in to manage global projects, approvals, and settlement timing.
              </h1>
            </div>
            <div className="mt-6 rounded-[1.7rem] border border-white/20 bg-white/12 p-6 backdrop-blur lg:mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Why this matters</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">One place for identity, escrow, and payout intelligence.</p>
              <p className="mt-4 text-sm leading-7 text-blue-100">
                Providers keep their handle and payout preferences. Clients keep project visibility, change approvals, and release control.
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_32%)]" />
        </section>

        <section className="flex items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-10 lg:px-12">
          <div className="w-full max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Welcome back</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Sign in</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Enter your credentials to open your dashboard and continue the project lifecycle where you left off.
            </p>
            {searchParams?.error ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{searchParams.error}</p> : null}
            {searchParams?.message ? <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{searchParams.message}</p> : null}
            <form action={loginAction} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" placeholder="name@company.com" required />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Enter your password" required />
              </div>
              <PendingSubmitButton
                pendingLabel="Signing in..."
                className="w-full rounded-full bg-brand px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)] transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-80"
              >
                Continue to dashboard
              </PendingSubmitButton>
            </form>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>Need an account?</span>
              <Link href="/auth/signup?role=client" className="font-semibold text-blue-700">Create one</Link>
              <span className="text-slate-300">|</span>
              <Link href="/" className="font-semibold text-slate-600">Back to home</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

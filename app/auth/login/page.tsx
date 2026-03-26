import Link from 'next/link';

import { loginAction } from '@/app/actions';

export default function LoginPage({ searchParams }: { searchParams?: { error?: string; message?: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-ink px-8 py-12 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Live auth</p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">Login to your CrossRoute workspace</h1>
          <p className="mt-4 max-w-md text-white/75">
            This is now wired for real Supabase authentication. Use the same credentials you created during signup.
          </p>
        </div>
        <div className="px-8 py-12">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Login</h2>
          {searchParams?.error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{searchParams.error}</p> : null}
          {searchParams?.message ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{searchParams.message}</p> : null}
          <form action={loginAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Enter your password" required />
            </div>
            <button className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
              Continue to dashboard
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-500">
            Need an account? <Link href="/auth/signup" className="font-semibold text-accent">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

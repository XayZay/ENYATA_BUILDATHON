import Link from 'next/link';

import { loginAction } from '@/app/actions';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-ink px-8 py-12 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Client or Provider</p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">Open the CrossRoute dashboard</h1>
          <p className="mt-4 max-w-md text-white/75">
            This MVP uses a demo session so you can switch roles and walk the hackathon flow without external auth setup.
          </p>
        </div>
        <div className="px-8 py-12">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Login</h2>
          <form action={loginAction} className="mt-8 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" placeholder="Ada Client" />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="client@crossroute.demo" />
              </div>
            </div>
            <div>
              <label htmlFor="role">Role</label>
              <select id="role" name="role" defaultValue="client">
                <option value="client">Client</option>
                <option value="provider">Provider</option>
              </select>
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

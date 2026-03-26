import Link from 'next/link';

import { signupAction } from '@/app/actions';

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-line bg-white p-10 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Onboarding</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Create your CrossRoute demo account</h1>
        <p className="mt-4 text-slate-600">
          Choose the role you want to explore. The role determines the dashboard, project permissions, and payout actions you see.
        </p>
        <form action={signupAction} className="mt-8 space-y-5">
          <div>
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" placeholder="Tunde Provider" />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="provider@crossroute.demo" />
          </div>
          <div>
            <label htmlFor="role">Role</label>
            <select id="role" name="role" defaultValue="provider">
              <option value="provider">Provider</option>
              <option value="client">Client</option>
            </select>
          </div>
          <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Create account
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Already have access? <Link href="/auth/login" className="font-semibold text-accent">Login here</Link>
        </p>
      </div>
    </main>
  );
}

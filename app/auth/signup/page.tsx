import Link from 'next/link';

import { signupAction } from '@/app/actions';
import type { Role } from '@/lib/types';

export default function SignupPage({ searchParams }: { searchParams?: { error?: string; role?: string } }) {
  const selectedRole = searchParams?.role === 'client' ? 'client' : 'provider';

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-line bg-white p-10 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Onboarding</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          Create your {selectedRole === 'provider' ? 'provider' : 'client'} account
        </h1>
        <p className="mt-4 text-slate-600">
          {selectedRole === 'provider'
            ? 'Providers create a real account first, then complete a public profile so clients can discover and invite them.'
            : 'Clients create a real account first, then start protected projects by inviting providers with email, handle, or provider code.'}
        </p>
        {searchParams?.error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{searchParams.error}</p> : null}
        <form action={signupAction} className="mt-8 space-y-5">
          <div>
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" placeholder={selectedRole === 'provider' ? 'Tunde Provider' : 'Ada Client'} required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder={selectedRole === 'provider' ? 'provider@example.com' : 'client@example.com'} required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Create a secure password" minLength={8} required />
          </div>
          <div>
            <label htmlFor="role">Role</label>
            <select id="role" name="role" defaultValue={selectedRole}>
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

import Link from 'next/link';

import { completeProviderProfileAction } from '@/app/actions';
import { getViewerOrRedirect } from '@/lib/auth';
import { getProviderProfile } from '@/lib/data';

export default async function ProviderProfilePage({ searchParams }: { searchParams?: { error?: string } }) {
  const viewer = await getViewerOrRedirect();
  const profile = await getProviderProfile(viewer.userId);

  if (viewer.role !== 'provider') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-[2rem] border border-line bg-white p-10 shadow-soft">
          <p className="text-sm text-slate-600">Only provider accounts need a provider profile.</p>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Go to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl rounded-[2rem] border border-line bg-white p-10 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Provider profile</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Set up how clients find you</h1>
        <p className="mt-4 text-slate-600">
          Your handle and provider code become your identity inside CrossRoute. Clients can use them to invite you into projects.
        </p>
        {searchParams?.error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{searchParams.error}</p> : null}
        <form action={completeProviderProfileAction} className="mt-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="handle">Handle</label>
              <input id="handle" name="handle" defaultValue={profile?.handle ?? ''} placeholder="tunde-design" required />
            </div>
            <div>
              <label htmlFor="specialty">Specialty</label>
              <input id="specialty" name="specialty" defaultValue={profile?.specialty ?? ''} placeholder="Brand identity, web design, product design" required />
            </div>
          </div>
          <div>
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" rows={4} defaultValue={profile?.bio ?? ''} placeholder="Describe what you do and the kind of clients you work with." />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="country">Country</label>
              <input id="country" name="country" defaultValue={profile?.country ?? 'Nigeria'} required />
            </div>
            <div>
              <label htmlFor="preferredPayoutChannel">Preferred payout channel</label>
              <input id="preferredPayoutChannel" name="preferredPayoutChannel" defaultValue={profile?.preferredPayoutChannel ?? 'Interswitch'} required />
            </div>
            <div>
              <label htmlFor="availabilityStatus">Availability</label>
              <select id="availabilityStatus" name="availabilityStatus" defaultValue={profile?.availabilityStatus ?? 'available'}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="limited">Limited capacity</option>
              </select>
            </div>
          </div>
          <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Save provider profile
          </button>
        </form>
      </div>
    </main>
  );
}

import Link from 'next/link';

import { completeProviderProfileAction } from '@/app/actions';
import { PendingSubmitButton } from '@/components/pending-submit-button';
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
          <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">Go to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mist px-6 py-8 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1450px] overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0f2da5_0%,#1f4fff_100%)] px-8 py-10 text-white lg:px-12 lg:py-14">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-3xl font-semibold tracking-tight text-white">Provider profile</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">Searchable identity layer</p>
              <h1 className="mt-16 max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight">
                Set up how clients discover you before money starts moving.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-blue-100">
                Your handle and provider code become your internal identity inside CrossRoute. Clients will use them to invite you into protected projects.
              </p>
            </div>
            <div className="rounded-[1.7rem] border border-white/20 bg-white/12 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">What clients see</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">@{profile?.handle ?? 'your-handle'}</p>
              <p className="mt-2 text-sm text-blue-100">Provider code: {profile?.providerCode ?? 'Generated after save'}</p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_32%)]" />
        </section>

        <section className="flex items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-10 lg:px-12">
          <div className="w-full max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Profile completion</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Complete your provider identity</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Make yourself easy to find, easy to trust, and ready for client invites.
            </p>
            {searchParams?.error ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{searchParams.error}</p> : null}
            <form action={completeProviderProfileAction} className="mt-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="handle">Handle</label>
                  <input id="handle" name="handle" defaultValue={profile?.handle ?? ''} placeholder="tunde-design" required />
                </div>
                <div>
                  <label htmlFor="specialty">Specialty</label>
                  <input id="specialty" name="specialty" defaultValue={profile?.specialty ?? ''} placeholder="Brand identity, product design, frontend" required />
                </div>
              </div>
              <div>
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" name="bio" rows={4} defaultValue={profile?.bio ?? ''} placeholder="Describe the work you do, the clients you help, and your strongest outcomes." />
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
              <PendingSubmitButton
                pendingLabel="Saving profile..."
                className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)] transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-80"
              >
                Save provider profile
              </PendingSubmitButton>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

import { createProjectAction } from '@/app/actions';
import { ProviderLookupField } from '@/components/provider-lookup-field';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';

export default async function NewProjectPage({ searchParams }: { searchParams?: { error?: string } }) {
  const viewer = await getViewerOrRedirect();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">New project route</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Create a protected escrow agreement around a real provider relationship.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            Find the provider inside CrossRoute, capture the scope, and break payment into milestone releases so neither side has to manage trust manually.
          </p>
        </div>
        <Surface className="overflow-hidden border-blue-100 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_68%)] p-0">
          <div className="border-b border-blue-100 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Provider connection</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">How the client and provider connect</h2>
          </div>
          <div className="space-y-4 px-6 py-6 text-sm leading-7 text-slate-600">
            <p>1. The provider creates a CrossRoute account and completes a public profile.</p>
            <p>2. The client searches by email, handle, provider code, or specialty.</p>
            <p>3. The project becomes the shared source of truth for funding, approvals, and settlement timing decisions.</p>
          </div>
        </Surface>
      </section>

      {viewer.role !== 'client' ? (
        <Surface>
          <p className="text-sm text-slate-600">Only client accounts can create new projects.</p>
        </Surface>
      ) : (
        <form action={createProjectAction} className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Surface className="space-y-8">
            <div className="space-y-6">
              {searchParams?.error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{searchParams.error}</p> : null}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="title">Project title</label>
                  <input id="title" name="title" placeholder="Brand Identity Design" required />
                </div>
                <ProviderLookupField />
              </div>
              <div>
                <label htmlFor="description">Project scope</label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Describe the business outcome, deliverables, review checkpoints, and what the client expects to approve."
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Milestone schedule</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Define how escrow unlocks over time</h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">3-step template</span>
              </div>
              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="rounded-[1.75rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_20px_48px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Milestone {index}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
                        {index === 1 ? 'Kickoff' : index === 2 ? 'Build' : 'Release'}
                      </span>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor={'milestoneTitle' + index}>Title</label>
                        <input
                          id={'milestoneTitle' + index}
                          name={'milestoneTitle' + index}
                          placeholder={index === 1 ? 'Discovery' : index === 2 ? 'Design and iteration' : 'Final delivery'}
                          required={index < 3}
                        />
                      </div>
                      <div>
                        <label htmlFor={'milestoneDescription' + index}>Description</label>
                        <textarea id={'milestoneDescription' + index} name={'milestoneDescription' + index} rows={3} placeholder="What gets released at this checkpoint?" />
                      </div>
                      <div>
                        <label htmlFor={'milestoneAmount' + index}>Amount (USD)</label>
                        <input
                          id={'milestoneAmount' + index}
                          name={'milestoneAmount' + index}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={index === 1 ? '500' : index === 2 ? '1000' : '500'}
                          required={index < 3}
                        />
                      </div>
                      <div>
                        <label htmlFor={'milestoneDueDate' + index}>Due date</label>
                        <input id={'milestoneDueDate' + index} name={'milestoneDueDate' + index} type="date" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Surface>

          <div className="space-y-6">
            <Surface className="border-blue-100 bg-[#1956e9] p-8 text-white shadow-[0_28px_90px_rgba(37,99,235,0.28)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Escrow summary</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Secure the relationship before work begins.</h2>
              <p className="mt-4 text-sm leading-7 text-blue-100">
                CrossRoute turns every project into a release schedule: fund once, approve deliveries with confidence, and keep change requests inside the contract itself.
              </p>
              <button className="mt-8 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                Create draft project
              </button>
            </Surface>
            <Surface>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Before you submit</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Make sure the provider has completed their profile so clients can discover them by handle and code.</p>
                <p>Keep milestone titles outcome-based so release decisions are easy to understand later.</p>
                <p>Use the project description to capture success criteria, not just tasks.</p>
              </div>
            </Surface>
          </div>
        </form>
      )}
    </div>
  );
}


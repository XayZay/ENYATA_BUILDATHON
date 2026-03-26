import { createProjectAction } from '@/app/actions';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';

export default async function NewProjectPage({ searchParams }: { searchParams?: { error?: string } }) {
  const viewer = await getViewerOrRedirect();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">New project</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Create a milestone-backed escrow agreement</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Capture the scope, identify the provider by email, handle, or provider code, and define milestone funding terms.
        </p>
      </section>
      {viewer.role !== 'client' ? (
        <Surface>
          <p className="text-sm text-slate-600">Only clients can create new projects.</p>
        </Surface>
      ) : (
        <Surface>
          {searchParams?.error ? <p className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{searchParams.error}</p> : null}
          <form action={createProjectAction} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="title">Project title</label>
                <input id="title" name="title" placeholder="Brand Identity Design" required />
              </div>
              <div>
                <label htmlFor="providerIdentifier">Provider email, handle, or code</label>
                <input id="providerIdentifier" name="providerIdentifier" placeholder="provider@example.com or @tunde-design or CR-AB12-7K9P" required />
              </div>
            </div>
            <div>
              <label htmlFor="description">Project description</label>
              <textarea id="description" name="description" rows={4} placeholder="Describe the outcomes, the key deliverables, and the success criteria." required />
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {[1, 2, 3].map((index) => (
                <div key={index} className="rounded-3xl border border-line bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Milestone {index}</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor={'milestoneTitle' + index}>Title</label>
                      <input id={'milestoneTitle' + index} name={'milestoneTitle' + index} placeholder={index === 1 ? 'Discovery' : index === 2 ? 'Design' : 'Final delivery'} required={index < 3} />
                    </div>
                    <div>
                      <label htmlFor={'milestoneDescription' + index}>Description</label>
                      <textarea id={'milestoneDescription' + index} name={'milestoneDescription' + index} rows={3} placeholder="What gets delivered here?" />
                    </div>
                    <div>
                      <label htmlFor={'milestoneAmount' + index}>Amount (USD)</label>
                      <input id={'milestoneAmount' + index} name={'milestoneAmount' + index} type="number" min="0" step="0.01" placeholder={index === 1 ? '500' : index === 2 ? '1000' : '500'} required={index < 3} />
                    </div>
                    <div>
                      <label htmlFor={'milestoneDueDate' + index}>Due date</label>
                      <input id={'milestoneDueDate' + index} name={'milestoneDueDate' + index} type="date" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
              Create draft project
            </button>
          </form>
        </Surface>
      )}
    </div>
  );
}

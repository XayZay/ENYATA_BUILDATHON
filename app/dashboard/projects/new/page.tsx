import { createProjectAction } from '@/app/actions';
import { Surface } from '@/components/dashboard-shell';
import { getViewerOrRedirect } from '@/lib/auth';

export default async function NewProjectPage() {
  const viewer = await getViewerOrRedirect();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">New project</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Create a milestone-backed escrow agreement</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Capture the scope, invite the provider by email, and define the milestone structure that will control release conditions.
        </p>
      </section>
      {viewer.role !== 'client' ? (
        <Surface>
          <p className="text-sm text-slate-600">Only clients can create new projects in this MVP.</p>
        </Surface>
      ) : (
        <Surface>
          <form action={createProjectAction} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="title">Project title</label>
                <input id="title" name="title" placeholder="Brand Identity Design" required />
              </div>
              <div>
                <label htmlFor="providerEmail">Provider email</label>
                <input id="providerEmail" name="providerEmail" type="email" defaultValue="provider@crossroute.demo" required />
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

import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  markMilestoneDeliveredAction,
  raiseDisputeAction,
  releaseMilestoneAction,
  respondToChangeOrderAction,
  startProjectAction,
  submitChangeOrderAction
} from '@/app/actions';
import { ChangeOrderList } from '@/components/change-order-list';
import { Surface } from '@/components/dashboard-shell';
import { MilestoneTimeline } from '@/components/milestone-timeline';
import { StatusBadge } from '@/components/status-badge';
import { getViewerOrRedirect } from '@/lib/auth';
import { hydrateProject } from '@/lib/data';
import { formatUsd } from '@/lib/utils';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const viewer = await getViewerOrRedirect();

  let project;
  try {
    project = await hydrateProject(params.id, viewer);
  } catch {
    notFound();
  }

  const isClient = viewer.role === 'client';
  const isProvider = viewer.role === 'provider';
  const pendingChangeOrders = project.changeOrders.filter((entry) => entry.status !== 'rejected' && entry.status !== 'fully_approved');

  return (
    <div className="space-y-8">
      <section className="dashboard-grid">
        <Surface className="overflow-hidden border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef5ff_100%)] p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">Project detail</p>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{project.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{project.description}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Escrow total</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{formatUsd(project.totalAmountUsd)}</p>
            </div>
            <div className="rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Client</p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{project.client.fullName}</p>
            </div>
            <div className="rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Provider</p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{project.provider.fullName}</p>
              {project.providerProfile?.handle ? <p className="mt-2 text-sm text-blue-700">@{project.providerProfile.handle}</p> : null}
            </div>
          </div>
        </Surface>

        <Surface className="border-blue-100 bg-[linear-gradient(180deg,#143abf_0%,#1f4fff_100%)] p-8 text-white shadow-[0_32px_90px_rgba(37,99,235,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Project actions</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Advance the contract state with confidence.</h2>
          <div className="mt-8 space-y-4">
            {isClient && project.status === 'draft' ? (
              <Link href={'/dashboard/projects/' + project.id + '/fund'} className="block rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                Fund escrow
              </Link>
            ) : null}
            {isClient && project.status === 'funded' ? (
              <form action={startProjectAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <button className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">Confirm work has started</button>
              </form>
            ) : null}
            {isClient
              ? project.milestones
                  .filter((milestone) => milestone.status === 'funded' && milestone.deliveredAt)
                  .map((milestone) => (
                    <form key={milestone.id} action={releaseMilestoneAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="milestoneId" value={milestone.id} />
                      <button className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                        Release {milestone.title}
                      </button>
                    </form>
                  ))
              : null}
            {isProvider
              ? project.milestones
                  .filter((milestone) => milestone.status === 'funded' && !milestone.deliveredAt)
                  .map((milestone) => (
                    <form key={milestone.id} action={markMilestoneDeliveredAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="milestoneId" value={milestone.id} />
                      <button className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                        Mark {milestone.title} delivered
                      </button>
                    </form>
                  ))
              : null}
            {isProvider ? (
              <Link href={'/dashboard/projects/' + project.id + '/payout'} className="block rounded-full border border-white/20 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15">
                Open payout routing
              </Link>
            ) : null}
            <form action={raiseDisputeAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <button className="w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                Raise dispute
              </button>
            </form>
          </div>
        </Surface>
      </section>

      <section className="dashboard-grid">
        <Surface>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Milestone tracker</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Protected release schedule</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{project.milestones.length} milestones</span>
          </div>
          <div className="mt-6">
            <MilestoneTimeline milestones={project.milestones} />
          </div>
        </Surface>

        <Surface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Agreement Shield</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Change orders stay inside the contract.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Scope changes are persisted, reviewable, and auditable even when rejected.
          </p>
          <form action={submitChangeOrderAction} className="mt-6 space-y-4">
            <input type="hidden" name="projectId" value={project.id} />
            <div>
              <label htmlFor="milestoneIds">Affected milestone</label>
              <select id="milestoneIds" name="milestoneIds" defaultValue={project.milestones[project.milestones.length - 1]?.id}>
                {project.milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>{milestone.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="newAmountUsd">New amount (USD)</label>
              <input id="newAmountUsd" name="newAmountUsd" type="number" min="0" step="0.01" placeholder="800" required />
            </div>
            <div>
              <label htmlFor="reason">Reason</label>
              <textarea id="reason" name="reason" rows={3} placeholder="Explain the scope shift or additional work requested." required />
            </div>
            <button className="w-full rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent">
              Submit change order
            </button>
          </form>
          {pendingChangeOrders.length > 0 ? (
            <div className="mt-6 space-y-3">
              {pendingChangeOrders.map((changeOrder) => (
                <div key={changeOrder.id} className="rounded-[1.5rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
                  <p className="text-sm leading-7 text-slate-600">{changeOrder.reason}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={respondToChangeOrderAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                      <input type="hidden" name="decision" value="approve" />
                      <button className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent">Approve</button>
                    </form>
                    <form action={respondToChangeOrderAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                      <input type="hidden" name="decision" value="reject" />
                      <button className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70">Reject</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Surface>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Audit trail</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Every change order, preserved.</h2>
        </div>
        <ChangeOrderList changeOrders={project.changeOrders} />
      </section>
    </div>
  );
}


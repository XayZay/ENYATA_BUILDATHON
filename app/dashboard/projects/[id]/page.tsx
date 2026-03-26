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
import { hydrateProject } from '@/lib/mock-db';
import { formatUsd } from '@/lib/utils';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const viewer = await getViewerOrRedirect();

  let project;
  try {
    project = hydrateProject(params.id);
  } catch {
    notFound();
  }

  const isClient = viewer.role === 'client';
  const isProvider = viewer.role === 'provider';
  const pendingChangeOrders = project.changeOrders.filter((entry) => entry.status !== 'rejected' && entry.status !== 'fully_approved');

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Project detail</p>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">{project.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">{project.description}</p>
        </div>
        <div className="rounded-[1.5rem] border border-line bg-white px-6 py-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Escrow total</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{formatUsd(project.totalAmountUsd)}</p>
          <p className="mt-2 text-sm text-slate-500">Client: {project.client.fullName} | Provider: {project.provider.fullName}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Surface>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Milestones</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Protected release schedule</h2>
            </div>
            {isClient && project.status === 'draft' ? (
              <Link href={'/dashboard/projects/' + project.id + '/fund'} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
                Fund escrow
              </Link>
            ) : null}
          </div>
          <div className="mt-6">
            <MilestoneTimeline milestones={project.milestones} />
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Actions</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Next best move</h2>
            <div className="mt-6 space-y-4">
              {isClient && project.status === 'funded' ? (
                <form action={startProjectAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <button className="w-full rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Confirm work has started</button>
                </form>
              ) : null}
              {isClient
                ? project.milestones
                    .filter((milestone) => milestone.status === 'funded')
                    .map((milestone) => (
                      <form key={milestone.id} action={releaseMilestoneAction}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="milestoneId" value={milestone.id} />
                        <button className="w-full rounded-full border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50">
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
                        <button className="w-full rounded-full border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50">
                          Mark {milestone.title} delivered
                        </button>
                      </form>
                    ))
                : null}
              <form action={raiseDisputeAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="role" value={viewer.role} />
                <button className="w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                  Raise dispute
                </button>
              </form>
              {isProvider ? (
                <Link href={'/dashboard/projects/' + project.id + '/payout'} className="block rounded-full bg-brand px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-700">
                  Open payout routing
                </Link>
              ) : null}
            </div>
          </Surface>

          <Surface>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Change order flow</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Agreement Shield</h2>
            <p className="mt-3 text-sm text-slate-600">
              Scope changes are always logged, even when rejected. This keeps the audit trail intact for both sides.
            </p>
            <form action={submitChangeOrderAction} className="mt-6 space-y-4">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="role" value={viewer.role} />
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
                <input id="newAmountUsd" name="newAmountUsd" type="number" min="0" step="0.01" placeholder="800" />
              </div>
              <div>
                <label htmlFor="reason">Reason</label>
                <textarea id="reason" name="reason" rows={3} placeholder="Explain the scope shift or extra work requested." />
              </div>
              <button className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-ink ring-1 ring-line transition hover:bg-slate-50">
                Submit change order
              </button>
            </form>
            {pendingChangeOrders.length > 0 ? (
              <div className="mt-6 space-y-3">
                {pendingChangeOrders.map((changeOrder) => (
                  <div key={changeOrder.id} className="rounded-3xl border border-line bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">{changeOrder.reason}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <form action={respondToChangeOrderAction}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                        <input type="hidden" name="decision" value="approve" />
                        <input type="hidden" name="role" value={viewer.role} />
                        <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">Approve</button>
                      </form>
                      <form action={respondToChangeOrderAction}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                        <input type="hidden" name="decision" value="reject" />
                        <input type="hidden" name="role" value={viewer.role} />
                        <button className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white">Reject</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </Surface>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">History</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Change order audit trail</h2>
        </div>
        <ChangeOrderList changeOrders={project.changeOrders} />
      </section>
    </div>
  );
}

import { Surface } from '@/components/dashboard-shell';
import { LoadingLink } from '@/components/loading-link';
import { getViewerOrRedirect } from '@/lib/auth';
import { listProjects, listPayoutRequests } from '@/lib/data';
import { formatRelative, formatUsd } from '@/lib/utils';

function includesQuery(query: string, ...values: Array<string | null | undefined>) {
  const haystack = values.filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(query);
}

export default async function DashboardSearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const viewer = await getViewerOrRedirect();
  const rawQuery = searchParams?.q?.trim() ?? '';
  const query = rawQuery.toLowerCase();
  const projects = await listProjects(viewer);

  const projectResults = rawQuery
    ? projects.filter((project) =>
        includesQuery(
          query,
          project.title,
          project.description,
          project.client.fullName,
          project.client.email,
          project.provider.fullName,
          project.provider.email,
          project.providerProfile?.handle,
          project.providerProfile?.providerCode,
          project.status
        )
      )
    : [];

  const peopleMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    roleLabel: string;
    handle?: string | null;
    providerCode?: string | null;
    href: string;
  }>();

  for (const project of projects) {
    const entries = viewer.role === 'client'
      ? [{
          id: project.provider.id,
          name: project.provider.fullName,
          email: project.provider.email,
          roleLabel: 'Provider',
          handle: project.providerProfile?.handle,
          providerCode: project.providerProfile?.providerCode,
          href: '/dashboard/projects/' + project.id
        }]
      : [{
          id: project.client.id,
          name: project.client.fullName,
          email: project.client.email,
          roleLabel: 'Client',
          href: '/dashboard/projects/' + project.id
        }];

    for (const entry of entries) {
      if (!peopleMap.has(entry.id)) {
        peopleMap.set(entry.id, entry);
      }
    }
  }

  const peopleResults = rawQuery
    ? [...peopleMap.values()].filter((person) =>
        includesQuery(query, person.name, person.email, person.roleLabel, person.handle, person.providerCode)
      )
    : [];

  const payoutProjects = projects.filter((project) =>
    project.milestones.some((milestone) => milestone.status === 'released')
  );

  const providerPayoutRequests = viewer.role === 'provider'
    ? await Promise.all(
        payoutProjects.map(async (project) => ({
          project,
          requests: await listPayoutRequests(project.id, viewer)
        }))
      )
    : [];

  const payoutResults = rawQuery
    ? (
        viewer.role === 'provider'
          ? providerPayoutRequests.flatMap(({ project, requests }) =>
              requests
                .filter((request) =>
                  includesQuery(
                    query,
                    project.title,
                    project.provider.fullName,
                    project.client.fullName,
                    request.selectedPlatform,
                    request.status
                  )
                )
                .map((request) => ({
                  id: request.id,
                  title: project.title,
                  detail: formatUsd(request.amountUsd) + ' payout request • ' + request.status,
                  href: '/dashboard/projects/' + project.id + '/payout',
                  meta: formatRelative(request.createdAt)
                }))
          )
          : payoutProjects
              .filter((project) =>
                includesQuery(
                  query,
                  project.title,
                  project.provider.fullName,
                  project.client.fullName,
                  'payout release released interswitch'
                )
              )
              .map((project) => {
                const releasedUsd = project.milestones
                  .filter((milestone) => milestone.status === 'released')
                  .reduce((sum, milestone) => sum + milestone.amountUsd, 0);

                return {
                  id: project.id,
                  title: project.title,
                  detail: formatUsd(releasedUsd) + ' released to payout flow',
                  href: '/dashboard/projects/' + project.id,
                  meta: project.status.replace(/_/g, ' ')
                };
              })
      )
    : [];

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Workspace search</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {rawQuery ? 'Results for "' + rawQuery + '"' : 'Search your workspace'}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Search spans projects, payout activity, and the providers or clients connected to the work you can access.
        </p>
      </section>

      {!rawQuery ? (
        <Surface>
          <p className="text-sm text-slate-500">Type a project title, handle, provider code, client name, or payout keyword in the header search bar to begin.</p>
        </Surface>
      ) : null}

      {rawQuery ? (
        <div className="grid gap-6 xl:grid-cols-3">
          <Surface>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Projects</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{projectResults.length} matches</h2>
            <div className="mt-6 space-y-4">
              {projectResults.length === 0 ? (
                <p className="text-sm text-slate-500">No project matches.</p>
              ) : (
                projectResults.map((project) => (
                  <div key={project.id} className="rounded-[1.4rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
                    <p className="text-lg font-semibold text-slate-950">{project.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{project.description}</p>
                    <LoadingLink
                      href={'/dashboard/projects/' + project.id}
                      pendingLabel="Opening project..."
                      className="mt-4 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      Open project
                    </LoadingLink>
                  </div>
                ))
              )}
            </div>
          </Surface>

          <Surface>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">People</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{peopleResults.length} matches</h2>
            <div className="mt-6 space-y-4">
              {peopleResults.length === 0 ? (
                <p className="text-sm text-slate-500">No people matches.</p>
              ) : (
                peopleResults.map((person) => (
                  <div key={person.id} className="rounded-[1.4rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
                    <p className="text-lg font-semibold text-slate-950">{person.name}</p>
                    <p className="mt-2 text-sm text-slate-600">{person.email}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {person.roleLabel}
                      {person.handle ? ' • @' + person.handle : ''}
                      {person.providerCode ? ' • ' + person.providerCode : ''}
                    </p>
                    <LoadingLink
                      href={person.href}
                      pendingLabel="Opening match..."
                      className="mt-4 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70 disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      View related project
                    </LoadingLink>
                  </div>
                ))
              )}
            </div>
          </Surface>

          <Surface>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payout activity</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{payoutResults.length} matches</h2>
            <div className="mt-6 space-y-4">
              {payoutResults.length === 0 ? (
                <p className="text-sm text-slate-500">No payout matches.</p>
              ) : (
                payoutResults.map((result) => (
                  <div key={result.id} className="rounded-[1.4rem] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
                    <p className="text-lg font-semibold text-slate-950">{result.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{result.detail}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{result.meta}</p>
                    <LoadingLink
                      href={result.href}
                      pendingLabel="Opening payout..."
                      className="mt-4 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70 disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      Open result
                    </LoadingLink>
                  </div>
                ))
              )}
            </div>
          </Surface>
        </div>
      ) : null}
    </div>
  );
}

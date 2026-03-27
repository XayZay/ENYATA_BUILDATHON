import Link from 'next/link';

import { ProjectCard } from '@/components/project-card';
import { getViewerOrRedirect } from '@/lib/auth';
import { listProjects } from '@/lib/data';

export default async function ProjectsPage() {
  const viewer = await getViewerOrRedirect();
  const projects = await listProjects(viewer);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Projects ledger</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950">
            Every escrow, milestone, delivery, and change order in one shared operating view.
          </h1>
        </div>
        {viewer.role === 'client' ? (
          <Link href="/dashboard/projects/new" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent">
            Create a new project
          </Link>
        ) : null}
      </section>
      <div className="space-y-5">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} role={viewer.role} />
        ))}
        {projects.length === 0 ? <p className="text-sm text-slate-500">No projects yet.</p> : null}
      </div>
    </div>
  );
}


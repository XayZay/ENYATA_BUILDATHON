import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { createProject, listProjects } from '@/lib/mock-db';

export async function GET() {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ data: listProjects(viewer) });
}

export async function POST(request: Request) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  try {
    const project = createProject(body, viewer);
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create project' }, { status: 400 });
  }
}

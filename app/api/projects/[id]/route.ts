import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { hydrateProject } from '@/lib/data';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({ data: await hydrateProject(params.id, viewer) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Project not found' }, { status: 404 });
  }
}

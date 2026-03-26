import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { raiseDispute, startProject } from '@/lib/data';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  try {
    const data =
      body.status === 'in_progress'
        ? await startProject(params.id, viewer)
        : body.status === 'disputed'
          ? await raiseDispute(params.id, viewer)
          : null;

    if (!data) {
      return NextResponse.json({ error: 'Unsupported status transition' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update project' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { releaseMilestone } from '@/lib/data';

export async function POST(_: Request, { params }: { params: { id: string; mid: string } }) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({ data: await releaseMilestone(params.id, params.mid, viewer) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to release milestone' }, { status: 400 });
  }
}

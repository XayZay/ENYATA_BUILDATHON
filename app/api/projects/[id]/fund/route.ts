import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { fundProject } from '@/lib/data';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({ data: await fundProject(params.id, viewer) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to fund project' }, { status: 400 });
  }
}

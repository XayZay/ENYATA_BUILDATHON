import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { getRoutingOptions } from '@/lib/data';

export async function GET(request: Request) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  try {
    return NextResponse.json({ data: await getRoutingOptions(projectId, viewer) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to fetch rates' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { respondToChangeOrder } from '@/lib/data';

export async function PATCH(request: Request, { params }: { params: { id: string; coid: string } }) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  try {
    const data = await respondToChangeOrder(params.id, params.coid, viewer, body.decision);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update change order' }, { status: 400 });
  }
}

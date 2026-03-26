import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { markNotificationRead } from '@/lib/mock-db';

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({ data: markNotificationRead(params.id, viewer.userId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update notification' }, { status: 400 });
  }
}

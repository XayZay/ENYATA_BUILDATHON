import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { listNotifications } from '@/lib/data';

export async function GET() {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ data: await listNotifications(viewer.userId) });
}

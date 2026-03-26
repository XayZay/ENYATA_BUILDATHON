import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { logPayoutSelection } from '@/lib/data';

export async function POST(request: Request) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  try {
    const data = await logPayoutSelection(body.projectId, viewer, body.platform);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create payout' }, { status: 400 });
  }
}

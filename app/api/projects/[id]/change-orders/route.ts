import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { submitChangeOrder } from '@/lib/mock-db';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  try {
    const data = submitChangeOrder(params.id, body, viewer);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to submit change order' }, { status: 400 });
  }
}

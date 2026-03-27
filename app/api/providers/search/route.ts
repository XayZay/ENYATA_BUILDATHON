import { NextResponse } from 'next/server';

import { getOptionalViewer } from '@/lib/auth';
import { searchProviders } from '@/lib/data';

export async function GET(request: Request) {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';

  if (query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    return NextResponse.json({ data: await searchProviders(query) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to search providers' },
      { status: 400 }
    );
  }
}


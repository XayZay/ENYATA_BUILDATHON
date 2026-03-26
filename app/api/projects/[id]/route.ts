import { NextResponse } from 'next/server';

import { hydrateProject } from '@/lib/mock-db';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ data: hydrateProject(params.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Project not found' }, { status: 404 });
  }
}

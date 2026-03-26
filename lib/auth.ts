import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getDemoUser } from '@/lib/mock-db';
import type { Role, ViewerSession } from '@/lib/types';

const SESSION_COOKIE = 'crossroute-session';

function normalizeViewer(payload: Partial<ViewerSession> | null | undefined): ViewerSession | null {
  if (!payload?.role) {
    return null;
  }

  const fallback = getDemoUser(payload.role as Role);

  return {
    userId: payload.userId ?? fallback.id,
    email: payload.email ?? fallback.email,
    fullName: payload.fullName ?? fallback.fullName,
    role: payload.role as Role
  };
}

export async function getOptionalViewer(): Promise<ViewerSession | null> {
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    return normalizeViewer(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function getViewerOrRedirect(): Promise<ViewerSession> {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    redirect('/auth/login');
  }

  return viewer;
}

export async function setViewerSession(viewer: ViewerSession) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(viewer), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearViewerSession() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}

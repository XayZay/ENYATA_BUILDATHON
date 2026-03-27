import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { Role, ViewerSession } from '@/lib/types';

async function ensureProfile(user: User) {
  const admin = createAdminClient();
  const role = (user.user_metadata.role === 'provider' ? 'provider' : 'client') as Role;
  const fullName = typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name.trim()
    ? user.user_metadata.full_name.trim()
    : user.email?.split('@')[0] ?? 'CrossRoute User';

  const payload = {
    id: user.id,
    email: user.email ?? '',
    full_name: fullName,
    role
  };

  const { data, error } = await admin
    .from('users')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function toViewerSession(profile: { id: string; email: string; full_name: string; role: Role }): ViewerSession {
  return {
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role
  };
}

export async function getOptionalViewer(): Promise<ViewerSession | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await ensureProfile(user);
  return toViewerSession(profile);
}

export async function getViewerOrRedirect(): Promise<ViewerSession> {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    redirect('/auth/login');
  }

  return viewer;
}

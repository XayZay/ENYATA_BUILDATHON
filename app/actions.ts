'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getViewerOrRedirect, getOptionalViewer } from '@/lib/auth';
import {
  createProject,
  fundProject,
  getProviderProfile,
  logPayoutSelection,
  markMilestoneDelivered,
  markNotificationRead,
  raiseDispute,
  releaseMilestone,
  respondToChangeOrder,
  startProject,
  submitChangeOrder,
  upsertProviderProfile
} from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import type { PayoutPlatform, ProviderProfileInput, Role } from '@/lib/types';

function requireValue(formData: FormData, field: string) {
  const value = formData.get(field)?.toString().trim();
  if (!value) {
    throw new Error(field + ' is required');
  }
  return value;
}

async function getPostAuthRedirect() {
  const viewer = await getOptionalViewer();
  if (!viewer) {
    return '/dashboard';
  }

  if (viewer.role === 'provider') {
    const profile = await getProviderProfile(viewer.userId);
    if (!profile) {
      return '/auth/provider-profile';
    }
  }

  return '/dashboard';
}

export async function loginAction(formData: FormData) {
  const email = requireValue(formData, 'email');
  const password = requireValue(formData, 'password');
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message));
  }

  redirect(await getPostAuthRedirect());
}

export async function signupAction(formData: FormData) {
  const fullName = requireValue(formData, 'fullName');
  const email = requireValue(formData, 'email');
  const password = requireValue(formData, 'password');
  const role = requireValue(formData, 'role') as Role;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role
      }
    }
  });

  if (error) {
    redirect('/auth/signup?role=' + encodeURIComponent(role) + '&error=' + encodeURIComponent(error.message));
  }

  if (!data.session) {
    redirect('/auth/login?message=' + encodeURIComponent('Account created. Check your email if confirmation is enabled, then log in.'));
  }

  redirect(role === 'provider' ? '/auth/provider-profile' : '/dashboard');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function completeProviderProfileAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const payload: ProviderProfileInput = {
    handle: requireValue(formData, 'handle'),
    bio: formData.get('bio')?.toString().trim() || '',
    country: requireValue(formData, 'country'),
    specialty: requireValue(formData, 'specialty'),
    preferredPayoutChannel: requireValue(formData, 'preferredPayoutChannel'),
    availabilityStatus: requireValue(formData, 'availabilityStatus')
  };

  try {
    await upsertProviderProfile(payload, viewer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save provider profile';
    redirect('/auth/provider-profile?error=' + encodeURIComponent(message));
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function createProjectAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const title = requireValue(formData, 'title');
  const description = requireValue(formData, 'description');
  const providerIdentifier = requireValue(formData, 'providerIdentifier');

  const milestones = [1, 2, 3]
    .map((index) => ({
      title: formData.get('milestoneTitle' + index)?.toString().trim() || '',
      description: formData.get('milestoneDescription' + index)?.toString().trim() || '',
      amountUsd: Number(formData.get('milestoneAmount' + index) || 0),
      dueDate: formData.get('milestoneDueDate' + index)?.toString().trim() || undefined
    }))
    .filter((milestone) => milestone.title && milestone.amountUsd > 0);

  try {
    const project = await createProject({ title, description, providerIdentifier, milestones }, viewer);
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/projects');
    redirect('/dashboard/projects/' + project.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create project';
    redirect('/dashboard/projects/new?error=' + encodeURIComponent(message));
  }
}

export async function fundProjectAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  await fundProject(projectId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard/projects/' + projectId + '/fund');
  revalidatePath('/dashboard');
}

export async function startProjectAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  await startProject(projectId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard');
}

export async function raiseDisputeAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  await raiseDispute(projectId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard');
}

export async function markMilestoneDeliveredAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  const milestoneId = requireValue(formData, 'milestoneId');
  await markMilestoneDelivered(projectId, milestoneId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
}

export async function releaseMilestoneAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  const milestoneId = requireValue(formData, 'milestoneId');
  await releaseMilestone(projectId, milestoneId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard/projects/' + projectId + '/payout');
  revalidatePath('/dashboard');
}

export async function submitChangeOrderAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  const milestoneIds = requireValue(formData, 'milestoneIds').split(',').map((entry) => entry.trim()).filter(Boolean);
  await submitChangeOrder(
    projectId,
    {
      milestoneIds,
      newAmountUsd: Number(requireValue(formData, 'newAmountUsd')),
      reason: requireValue(formData, 'reason')
    },
    viewer
  );
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard');
}

export async function respondToChangeOrderAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  const changeOrderId = requireValue(formData, 'changeOrderId');
  const decision = requireValue(formData, 'decision') as 'approve' | 'reject';
  await respondToChangeOrder(projectId, changeOrderId, viewer, decision);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard');
}

export async function requestPayoutAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  const platform = requireValue(formData, 'platform') as PayoutPlatform;
  await logPayoutSelection(projectId, viewer, platform);
  revalidatePath('/dashboard/projects/' + projectId + '/payout');
  revalidatePath('/dashboard');
}

export async function markNotificationReadAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const notificationId = requireValue(formData, 'notificationId');
  await markNotificationRead(notificationId, viewer.userId);
  revalidatePath('/dashboard/notifications');
  revalidatePath('/dashboard');
}

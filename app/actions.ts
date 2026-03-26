'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { clearViewerSession, getViewerOrRedirect, setViewerSession } from '@/lib/auth';
import {
  createProject,
  getDemoUser,
  logPayoutSelection,
  markMilestoneDelivered,
  markNotificationRead,
  raiseDispute,
  releaseMilestone,
  respondToChangeOrder,
  startProject,
  submitChangeOrder,
  fundProject
} from '@/lib/mock-db';
import type { PayoutPlatform, Role } from '@/lib/types';

function requireValue(formData: FormData, field: string) {
  const value = formData.get(field)?.toString().trim();
  if (!value) {
    throw new Error(field + ' is required');
  }
  return value;
}

export async function loginAction(formData: FormData) {
  const role = requireValue(formData, 'role') as Role;
  const baseUser = getDemoUser(role);
  const email = formData.get('email')?.toString().trim() || baseUser.email;
  const fullName = formData.get('fullName')?.toString().trim() || baseUser.fullName;

  await setViewerSession({
    userId: baseUser.id,
    email,
    fullName,
    role
  });

  redirect('/dashboard');
}

export async function signupAction(formData: FormData) {
  await loginAction(formData);
}

export async function logoutAction() {
  await clearViewerSession();
  redirect('/');
}

export async function createProjectAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const title = requireValue(formData, 'title');
  const description = requireValue(formData, 'description');
  const providerEmail = requireValue(formData, 'providerEmail');

  const milestones = [1, 2, 3]
    .map((index) => ({
      title: formData.get('milestoneTitle' + index)?.toString().trim() || '',
      description: formData.get('milestoneDescription' + index)?.toString().trim() || '',
      amountUsd: Number(formData.get('milestoneAmount' + index) || 0),
      dueDate: formData.get('milestoneDueDate' + index)?.toString().trim() || undefined
    }))
    .filter((milestone) => milestone.title && milestone.amountUsd > 0);

  const project = createProject({ title, description, providerEmail, milestones }, viewer);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/projects');
  redirect('/dashboard/projects/' + project.id);
}

export async function fundProjectAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  fundProject(projectId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard/projects/' + projectId + '/fund');
  revalidatePath('/dashboard');
}

export async function startProjectAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  startProject(projectId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard');
}

export async function raiseDisputeAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  raiseDispute(projectId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard');
}

export async function markMilestoneDeliveredAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  const milestoneId = requireValue(formData, 'milestoneId');
  markMilestoneDelivered(projectId, milestoneId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
}

export async function releaseMilestoneAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  const milestoneId = requireValue(formData, 'milestoneId');
  releaseMilestone(projectId, milestoneId, viewer);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard/projects/' + projectId + '/payout');
  revalidatePath('/dashboard');
}

export async function submitChangeOrderAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  const milestoneIds = requireValue(formData, 'milestoneIds').split(',').map((entry) => entry.trim()).filter(Boolean);
  submitChangeOrder(
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
  respondToChangeOrder(projectId, changeOrderId, viewer, decision);
  revalidatePath('/dashboard/projects/' + projectId);
  revalidatePath('/dashboard');
}

export async function requestPayoutAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const projectId = requireValue(formData, 'projectId');
  const platform = requireValue(formData, 'platform') as PayoutPlatform;
  logPayoutSelection(projectId, viewer, platform);
  revalidatePath('/dashboard/projects/' + projectId + '/payout');
  revalidatePath('/dashboard');
}

export async function markNotificationReadAction(formData: FormData) {
  const viewer = await getViewerOrRedirect();
  const notificationId = requireValue(formData, 'notificationId');
  markNotificationRead(notificationId, viewer.userId);
  revalidatePath('/dashboard/notifications');
  revalidatePath('/dashboard');
}

import type {
  ChangeOrder,
  ChangeOrderInput,
  DashboardSummary,
  Milestone,
  Notification,
  PayoutPlatform,
  PayoutRequest,
  Project,
  ProjectDetail,
  Role,
  RoutingOption,
  Transaction,
  User,
  ViewerSession,
  CreateProjectInput
} from '@/lib/types';

interface MockState {
  users: User[];
  projects: Project[];
  milestones: Milestone[];
  changeOrders: ChangeOrder[];
  transactions: Transaction[];
  payoutRequests: PayoutRequest[];
  notifications: Notification[];
}

const DEMO_CLIENT_ID = 'user_client_demo';
const DEMO_PROVIDER_ID = 'user_provider_demo';

const PLATFORM_META: Record<PayoutPlatform, { label: string; feePercent: number; flatFeeUsd: number; processingTime: string; source: 'monierate' | 'interswitch' }> = {
  wise: { label: 'Wise', feePercent: 0.005, flatFeeUsd: 1.5, processingTime: '2-6 hours', source: 'monierate' },
  grey: { label: 'Grey', feePercent: 0.01, flatFeeUsd: 0, processingTime: 'Instant to 2 hours', source: 'monierate' },
  payoneer: { label: 'Payoneer', feePercent: 0.02, flatFeeUsd: 0, processingTime: 'Same day', source: 'monierate' },
  quidax: { label: 'Quidax', feePercent: 0.015, flatFeeUsd: 0, processingTime: '5-20 minutes', source: 'monierate' },
  interswitch: { label: 'Interswitch', feePercent: 0.0025, flatFeeUsd: 0.75, processingTime: 'Under 10 minutes', source: 'interswitch' }
};

const PLATFORM_RATES: Record<PayoutPlatform, number> = {
  wise: 1541,
  grey: 1537,
  payoneer: 1528,
  quidax: 1544,
  interswitch: 1539
};

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

function seedState(): MockState {
  const now = nowIso();
  const users: User[] = [
    {
      id: DEMO_CLIENT_ID,
      email: 'client@crossroute.demo',
      fullName: 'Ada Client',
      role: 'client',
      createdAt: now
    },
    {
      id: DEMO_PROVIDER_ID,
      email: 'provider@crossroute.demo',
      fullName: 'Tunde Provider',
      role: 'provider',
      createdAt: now
    }
  ];

  const projects: Project[] = [
    {
      id: 'proj_brand_identity',
      title: 'Brand Identity Design',
      description: 'Design a full identity system with discovery, concepting, and final asset delivery.',
      clientId: DEMO_CLIENT_ID,
      providerId: DEMO_PROVIDER_ID,
      totalAmountUsd: 2300,
      status: 'change_requested',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'proj_landing_refresh',
      title: 'Landing Page Refresh',
      description: 'Rebuild the marketing page with improved conversion sections and a responsive design pass.',
      clientId: DEMO_CLIENT_ID,
      providerId: DEMO_PROVIDER_ID,
      totalAmountUsd: 900,
      status: 'funded',
      createdAt: now,
      updatedAt: now
    }
  ];

  const milestones: Milestone[] = [
    {
      id: 'mile_discovery',
      projectId: 'proj_brand_identity',
      title: 'Discovery',
      description: 'Research, interviews, and creative direction.',
      amountUsd: 500,
      status: 'released',
      dueDate: '2026-03-28',
      orderIndex: 1,
      deliveredAt: now
    },
    {
      id: 'mile_design',
      projectId: 'proj_brand_identity',
      title: 'Design',
      description: 'Logo concepts, palette, and typography system.',
      amountUsd: 1000,
      status: 'funded',
      dueDate: '2026-04-03',
      orderIndex: 2,
      deliveredAt: now
    },
    {
      id: 'mile_final_delivery',
      projectId: 'proj_brand_identity',
      title: 'Final Delivery',
      description: 'Final files, brand guide, and revision round.',
      amountUsd: 800,
      status: 'funded',
      dueDate: '2026-04-10',
      orderIndex: 3,
      deliveredAt: null
    },
    {
      id: 'mile_lp_copy',
      projectId: 'proj_landing_refresh',
      title: 'Copy and IA',
      description: 'Messaging, structure, and wireframe decisions.',
      amountUsd: 300,
      status: 'funded',
      dueDate: '2026-03-30',
      orderIndex: 1,
      deliveredAt: null
    },
    {
      id: 'mile_lp_build',
      projectId: 'proj_landing_refresh',
      title: 'Visual Build',
      description: 'Implementation, QA, and launch support.',
      amountUsd: 600,
      status: 'funded',
      dueDate: '2026-04-06',
      orderIndex: 2,
      deliveredAt: null
    }
  ];

  const changeOrders: ChangeOrder[] = [
    {
      id: 'co_revision_round',
      projectId: 'proj_brand_identity',
      requestedBy: DEMO_PROVIDER_ID,
      originalAmountUsd: 500,
      newAmountUsd: 800,
      reason: 'Additional revision round requested after initial approval.',
      milestoneIds: ['mile_final_delivery'],
      status: 'pending',
      clientApprovedAt: null,
      providerApprovedAt: now,
      createdAt: now
    }
  ];

  const transactions: Transaction[] = [
    {
      id: 'txn_brand_deposit',
      projectId: 'proj_brand_identity',
      milestoneId: null,
      type: 'deposit',
      amountUsd: 2000,
      status: 'completed',
      interswitchReference: 'ISW-DEMO-DEP-1001',
      createdAt: now
    },
    {
      id: 'txn_brand_release_1',
      projectId: 'proj_brand_identity',
      milestoneId: 'mile_discovery',
      type: 'release',
      amountUsd: 500,
      status: 'completed',
      interswitchReference: 'ISW-DEMO-REL-1001',
      createdAt: now
    },
    {
      id: 'txn_landing_deposit',
      projectId: 'proj_landing_refresh',
      milestoneId: null,
      type: 'deposit',
      amountUsd: 900,
      status: 'completed',
      interswitchReference: 'ISW-DEMO-DEP-1002',
      createdAt: now
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_1',
      userId: DEMO_CLIENT_ID,
      message: 'Change order pending on Brand Identity Design.',
      read: false,
      link: '/dashboard/projects/proj_brand_identity',
      createdAt: now
    },
    {
      id: 'notif_2',
      userId: DEMO_PROVIDER_ID,
      message: 'Milestone release available for Brand Identity Design.',
      read: false,
      link: '/dashboard/projects/proj_brand_identity/payout',
      createdAt: now
    }
  ];

  return {
    users,
    projects,
    milestones,
    changeOrders,
    transactions,
    payoutRequests: [],
    notifications
  };
}

declare global {
  var __crossrouteMockState: MockState | undefined;
}

function getState() {
  if (!globalThis.__crossrouteMockState) {
    globalThis.__crossrouteMockState = seedState();
  }

  return globalThis.__crossrouteMockState;
}

function getUserById(userId: string) {
  const user = getState().users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

function notify(userId: string, message: string, link: string) {
  getState().notifications.unshift({
    id: createId('notif'),
    userId,
    message,
    read: false,
    link,
    createdAt: nowIso()
  });
}

function touchProject(projectId: string, status?: Project['status']) {
  const project = getProject(projectId);
  project.updatedAt = nowIso();

  if (status) {
    project.status = status;
  }

  return project;
}

export function getDemoUser(role: Role): User {
  return getState().users.find((entry) => entry.role === role) ?? getState().users[0];
}

export function listProjects(viewer: ViewerSession): ProjectDetail[] {
  const state = getState();
  const relevantProjects = state.projects.filter((project) => {
    return viewer.role === 'client' ? project.clientId === viewer.userId : project.providerId === viewer.userId;
  });

  return relevantProjects
    .map((project) => hydrateProject(project.id))
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function hydrateProject(projectId: string): ProjectDetail {
  const state = getState();
  const project = state.projects.find((entry) => entry.id === projectId);

  if (!project) {
    throw new Error('Project not found');
  }

  return {
    ...project,
    client: getUserById(project.clientId),
    provider: getUserById(project.providerId),
    milestones: state.milestones
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => a.orderIndex - b.orderIndex),
    changeOrders: state.changeOrders
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    transactions: state.transactions
      .filter((entry) => entry.projectId === projectId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  };
}

export function getProject(projectId: string) {
  const project = getState().projects.find((entry) => entry.id === projectId);

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
}

export function getDashboardSummary(viewer: ViewerSession): DashboardSummary {
  const projects = listProjects(viewer);
  const notifications = listNotifications(viewer.userId);
  const releasedUsd = projects
    .flatMap((project) => project.transactions)
    .filter((transaction) => transaction.type === 'release' && transaction.status === 'completed')
    .reduce((sum, transaction) => sum + transaction.amountUsd, 0);

  return {
    activeProjects: projects.filter((project) => project.status !== 'completed').length,
    changeRequests: projects.filter((project) => project.status === 'change_requested').length,
    unreadNotifications: notifications.filter((entry) => !entry.read).length,
    releasedUsd
  };
}

export function listNotifications(userId: string) {
  return getState().notifications
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function markNotificationRead(notificationId: string, userId: string) {
  const notification = getState().notifications.find((entry) => entry.id === notificationId && entry.userId === userId);

  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.read = true;
  return notification;
}

export function createProject(input: CreateProjectInput, viewer: ViewerSession) {
  if (viewer.role !== 'client') {
    throw new Error('Only clients can create projects');
  }

  const provider = getState().users.find((entry) => entry.email.toLowerCase() === input.providerEmail.toLowerCase() && entry.role === 'provider') ?? getDemoUser('provider');
  const totalAmountUsd = input.milestones.reduce((sum, milestone) => sum + milestone.amountUsd, 0);
  const projectId = createId('proj');
  const createdAt = nowIso();

  const project: Project = {
    id: projectId,
    title: input.title,
    description: input.description,
    clientId: viewer.userId,
    providerId: provider.id,
    totalAmountUsd,
    status: 'draft',
    createdAt,
    updatedAt: createdAt
  };

  getState().projects.unshift(project);
  input.milestones.forEach((milestone, index) => {
    getState().milestones.push({
      id: createId('mile'),
      projectId,
      title: milestone.title,
      description: milestone.description,
      amountUsd: milestone.amountUsd,
      status: 'pending',
      dueDate: milestone.dueDate ?? null,
      orderIndex: index + 1,
      deliveredAt: null
    });
  });

  notify(provider.id, 'New project invite received: ' + input.title + '.', '/dashboard/projects/' + projectId);
  notify(viewer.userId, 'Project created in draft: ' + input.title + '.', '/dashboard/projects/' + projectId);

  return hydrateProject(projectId);
}

export function fundProject(projectId: string, viewer: ViewerSession) {
  const project = getProject(projectId);

  if (viewer.role !== 'client' || project.clientId !== viewer.userId) {
    throw new Error('Only the client can fund this project');
  }

  getState().milestones.forEach((milestone) => {
    if (milestone.projectId === projectId) {
      milestone.status = 'funded';
    }
  });

  touchProject(projectId, 'funded');
  const transaction: Transaction = {
    id: createId('txn'),
    projectId,
    milestoneId: null,
    type: 'deposit',
    amountUsd: project.totalAmountUsd,
    status: 'completed',
    interswitchReference: 'ISW-DEMO-DEP-' + Math.floor(Math.random() * 9000 + 1000),
    createdAt: nowIso()
  };
  getState().transactions.unshift(transaction);
  notify(project.providerId, 'Project funded: ' + project.title + '.', '/dashboard/projects/' + projectId);
  notify(project.clientId, 'Escrow deposit confirmed for ' + project.title + '.', '/dashboard/projects/' + projectId);

  return transaction;
}

export function startProject(projectId: string, viewer: ViewerSession) {
  const project = getProject(projectId);
  if (viewer.role !== 'client' || project.clientId !== viewer.userId) {
    throw new Error('Only the client can start the project');
  }

  if (project.status !== 'funded') {
    throw new Error('Project must be funded first');
  }

  touchProject(projectId, 'in_progress');
  notify(project.providerId, 'Work can begin on ' + project.title + '.', '/dashboard/projects/' + projectId);
  return hydrateProject(projectId);
}

export function raiseDispute(projectId: string, viewer: ViewerSession) {
  const project = getProject(projectId);
  if (project.clientId !== viewer.userId && project.providerId !== viewer.userId) {
    throw new Error('You do not have access to this project');
  }

  touchProject(projectId, 'disputed');
  notify(project.clientId, 'Dispute raised on ' + project.title + '.', '/dashboard/projects/' + projectId);
  notify(project.providerId, 'Dispute raised on ' + project.title + '.', '/dashboard/projects/' + projectId);
  return hydrateProject(projectId);
}

export function markMilestoneDelivered(projectId: string, milestoneId: string, viewer: ViewerSession) {
  const project = getProject(projectId);
  if (viewer.role !== 'provider' || project.providerId !== viewer.userId) {
    throw new Error('Only the provider can mark delivery');
  }

  const milestone = getState().milestones.find((entry) => entry.id === milestoneId && entry.projectId === projectId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  milestone.deliveredAt = nowIso();
  touchProject(projectId, 'in_progress');
  notify(project.clientId, milestone.title + ' was marked delivered.', '/dashboard/projects/' + projectId);
  return milestone;
}

export function releaseMilestone(projectId: string, milestoneId: string, viewer: ViewerSession) {
  const project = getProject(projectId);
  if (viewer.role !== 'client' || project.clientId !== viewer.userId) {
    throw new Error('Only the client can release milestone funds');
  }

  const milestone = getState().milestones.find((entry) => entry.id === milestoneId && entry.projectId === projectId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  milestone.status = 'released';
  const transaction: Transaction = {
    id: createId('txn'),
    projectId,
    milestoneId,
    type: 'release',
    amountUsd: milestone.amountUsd,
    status: 'completed',
    interswitchReference: 'ISW-DEMO-REL-' + Math.floor(Math.random() * 9000 + 1000),
    createdAt: nowIso()
  };
  getState().transactions.unshift(transaction);

  const remaining = getState().milestones.filter((entry) => entry.projectId === projectId && entry.status !== 'released');
  touchProject(projectId, remaining.length === 0 ? 'completed' : 'in_progress');
  notify(project.providerId, 'Milestone released: ' + milestone.title + '.', '/dashboard/projects/' + projectId + '/payout');
  return transaction;
}

export function submitChangeOrder(projectId: string, input: ChangeOrderInput, viewer: ViewerSession) {
  const project = getProject(projectId);
  if (project.clientId !== viewer.userId && project.providerId !== viewer.userId) {
    throw new Error('You do not have access to this project');
  }

  const changeOrder: ChangeOrder = {
    id: createId('co'),
    projectId,
    requestedBy: viewer.userId,
    originalAmountUsd: input.milestoneIds.reduce((sum, milestoneId) => {
      const milestone = getState().milestones.find((entry) => entry.id === milestoneId);
      return sum + (milestone?.amountUsd ?? 0);
    }, 0),
    newAmountUsd: input.newAmountUsd,
    reason: input.reason,
    milestoneIds: input.milestoneIds,
    status: 'pending',
    clientApprovedAt: viewer.role === 'client' ? nowIso() : null,
    providerApprovedAt: viewer.role === 'provider' ? nowIso() : null,
    createdAt: nowIso()
  };

  getState().changeOrders.unshift(changeOrder);
  touchProject(projectId, 'change_requested');
  const approverId = viewer.role === 'client' ? project.providerId : project.clientId;
  notify(approverId, 'Change order awaiting your approval on ' + project.title + '.', '/dashboard/projects/' + projectId);
  return changeOrder;
}

export function respondToChangeOrder(projectId: string, changeOrderId: string, viewer: ViewerSession, decision: 'approve' | 'reject') {
  const project = getProject(projectId);
  const changeOrder = getState().changeOrders.find((entry) => entry.id === changeOrderId && entry.projectId === projectId);
  if (!changeOrder) {
    throw new Error('Change order not found');
  }

  if (decision === 'reject') {
    changeOrder.status = 'rejected';
    touchProject(projectId, 'in_progress');
    notify(project.clientId, 'A change order was rejected on ' + project.title + '.', '/dashboard/projects/' + projectId);
    notify(project.providerId, 'A change order was rejected on ' + project.title + '.', '/dashboard/projects/' + projectId);
    return changeOrder;
  }

  if (viewer.role === 'client') {
    changeOrder.clientApprovedAt = changeOrder.clientApprovedAt ?? nowIso();
    changeOrder.status = 'approved_client';
  } else {
    changeOrder.providerApprovedAt = changeOrder.providerApprovedAt ?? nowIso();
    changeOrder.status = 'approved_provider';
  }

  if (changeOrder.clientApprovedAt && changeOrder.providerApprovedAt) {
    const affectedMilestones = getState().milestones.filter((entry) => changeOrder.milestoneIds.includes(entry.id));
    const currentTotal = affectedMilestones.reduce((sum, milestone) => sum + milestone.amountUsd, 0);
    const delta = changeOrder.newAmountUsd - currentTotal;
    if (affectedMilestones.length > 0) {
      const finalMilestone = affectedMilestones[affectedMilestones.length - 1];
      finalMilestone.amountUsd += delta;
    }
    project.totalAmountUsd += delta;
    changeOrder.status = 'fully_approved';
    touchProject(projectId, 'in_progress');
    getState().transactions.unshift({
      id: createId('txn'),
      projectId,
      milestoneId: changeOrder.milestoneIds[changeOrder.milestoneIds.length - 1] ?? null,
      type: 'change_top_up',
      amountUsd: Math.max(delta, 0),
      status: 'completed',
      interswitchReference: 'ISW-DEMO-CHG-' + Math.floor(Math.random() * 9000 + 1000),
      createdAt: nowIso()
    });
    notify(project.clientId, 'Change order fully approved for ' + project.title + '.', '/dashboard/projects/' + projectId);
    notify(project.providerId, 'Change order fully approved for ' + project.title + '.', '/dashboard/projects/' + projectId);
  }

  return changeOrder;
}

export function getRoutingOptions(projectId: string, viewer: ViewerSession): RoutingOption[] {
  const project = hydrateProject(projectId);
  if (viewer.role !== 'provider' || project.providerId !== viewer.userId) {
    throw new Error('Only the provider can view payout routing');
  }

  const amountUsd = project.milestones.filter((entry) => entry.status === 'released').reduce((sum, milestone) => sum + milestone.amountUsd, 0);
  const options = (Object.keys(PLATFORM_META) as PayoutPlatform[]).map((platform) => {
    const meta = PLATFORM_META[platform];
    const feeUsd = amountUsd * meta.feePercent + meta.flatFeeUsd;
    const amountNgn = Math.max(0, (amountUsd - feeUsd) * PLATFORM_RATES[platform]);

    return {
      platform,
      label: meta.label,
      source: meta.source,
      rate: PLATFORM_RATES[platform],
      feeLabel:
        meta.flatFeeUsd > 0
          ? (meta.feePercent * 100).toFixed(meta.feePercent < 0.01 ? 1 : 0) + '% + $' + meta.flatFeeUsd.toFixed(2)
          : (meta.feePercent * 100).toFixed(meta.feePercent < 0.01 ? 1 : 0) + '%',
      feeUsd,
      amountUsd,
      amountNgn,
      processingTime: meta.processingTime,
      isBestValue: false,
      isRecommended: platform === 'interswitch'
    } satisfies RoutingOption;
  });

  const bestValue = [...options].sort((a, b) => b.amountNgn - a.amountNgn)[0];
  return options.map((option) => ({
    ...option,
    isBestValue: option.platform === bestValue.platform
  }));
}

export function logPayoutSelection(projectId: string, viewer: ViewerSession, platform: PayoutPlatform) {
  const project = getProject(projectId);
  if (viewer.role !== 'provider' || project.providerId !== viewer.userId) {
    throw new Error('Only the provider can log payout selections');
  }

  const option = getRoutingOptions(projectId, viewer).find((entry) => entry.platform === platform);
  if (!option) {
    throw new Error('Routing option not found');
  }

  const request: PayoutRequest = {
    id: createId('payout'),
    providerId: viewer.userId,
    projectId,
    amountUsd: option.amountUsd,
    selectedPlatform: platform,
    rateAtTimeNgn: option.rate,
    amountNgn: option.amountNgn,
    status: platform === 'interswitch' ? 'completed' : 'pending',
    createdAt: nowIso()
  };
  getState().payoutRequests.unshift(request);
  notify(viewer.userId, 'Payout route logged via ' + option.label + '.', '/dashboard/projects/' + projectId + '/payout');
  return request;
}

export function listPayoutRequests(projectId: string) {
  return getState().payoutRequests.filter((entry) => entry.projectId === projectId);
}

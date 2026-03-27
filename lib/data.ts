import { buildRoutingOptions, getUsdToNgnRate } from '@/lib/monierate';
import { isInterswitchConfigured } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  ChangeOrder,
  ChangeOrderInput,
  CreateProjectInput,
  DashboardSummary,
  Milestone,
  Notification,
  PayoutPlatform,
  PayoutRequest,
  Project,
  ProjectDetail,
  ProviderDashboardSnapshot,
  ProviderProfile,
  ProviderProfileInput,
  ProviderSearchResult,
  RoutingOption,
  Transaction,
  User,
  ViewerSession
} from '@/lib/types';

function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  return Number(value ?? 0);
}

function assertError(error: unknown) {
  if (error) {
    throw error;
  }
}

function normalizeHandle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/^@/, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizeSearchValue(value: string) {
  return value.replace(/[%_,()]/g, ' ').replace(/\s+/g, ' ').trim();
}

function createProviderCode(userId: string) {
  return 'CR-' + userId.slice(0, 4).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function createDemoInterswitchReference(prefix: string) {
  return 'ISW-DEMO-' + prefix + '-' + Date.now().toString().slice(-8);
}

function isProviderProfilesUnavailable(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { code?: string; message?: string };
  return candidate.code === 'PGRST205' || candidate.message?.includes('provider_profiles') === true;
}

function getProviderProfilesUnavailableMessage() {
  return 'Provider profile search is still warming up. If you just ran the migration, refresh Supabase and try again. You can still use the provider email right now.';
}

function isMilestoneConfirmationUnavailable(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { message?: string; details?: string; hint?: string; code?: string };
  const combined = [candidate.message, candidate.details, candidate.hint].filter(Boolean).join(' ').toLowerCase();
  return combined.includes('confirmed_at');
}

function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at
  };
}

function mapProviderProfile(row: any): ProviderProfile {
  return {
    id: row.id,
    userId: row.user_id,
    handle: row.handle,
    providerCode: row.provider_code,
    bio: row.bio,
    country: row.country,
    specialty: row.specialty,
    preferredPayoutChannel: row.preferred_payout_channel,
    availabilityStatus: row.availability_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    clientId: row.client_id,
    providerId: row.provider_id,
    totalAmountUsd: toNumber(row.total_amount_usd),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapMilestone(row: any): Milestone {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    amountUsd: toNumber(row.amount_usd),
    status: row.status,
    dueDate: row.due_date,
    orderIndex: row.order_index,
    deliveredAt: row.delivered_at,
    confirmedAt: row.confirmed_at ?? row.delivered_at ?? null
  };
}

function mapChangeOrder(row: any): ChangeOrder {
  return {
    id: row.id,
    projectId: row.project_id,
    requestedBy: row.requested_by,
    originalAmountUsd: toNumber(row.original_amount_usd),
    newAmountUsd: toNumber(row.new_amount_usd),
    reason: row.reason,
    milestoneIds: row.milestone_ids ?? [],
    status: row.status,
    clientApprovedAt: row.client_approved_at,
    providerApprovedAt: row.provider_approved_at,
    createdAt: row.created_at
  };
}

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    projectId: row.project_id,
    milestoneId: row.milestone_id,
    type: row.type,
    amountUsd: toNumber(row.amount_usd),
    status: row.status,
    interswitchReference: row.interswitch_reference,
    createdAt: row.created_at
  };
}

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    message: row.message,
    read: row.read,
    link: row.link,
    createdAt: row.created_at
  };
}

function mapPayoutRequest(row: any): PayoutRequest {
  return {
    id: row.id,
    providerId: row.provider_id,
    projectId: row.project_id,
    amountUsd: toNumber(row.amount_usd),
    selectedPlatform: row.selected_platform,
    rateAtTimeNgn: toNumber(row.rate_at_time_ngn),
    amountNgn: toNumber(row.amount_ngn),
    status: row.status,
    createdAt: row.created_at
  };
}

function toProviderSearchResult(user: User, profile?: ProviderProfile | null): ProviderSearchResult {
  return {
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    handle: profile?.handle ?? null,
    providerCode: profile?.providerCode ?? null,
    specialty: profile?.specialty ?? null,
    availabilityStatus: profile?.availabilityStatus ?? null,
    preferredPayoutChannel: profile?.preferredPayoutChannel ?? null,
    bio: profile?.bio ?? null
  };
}

async function notify(userId: string, message: string, link: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('notifications').insert({ user_id: userId, message, link });
  assertError(error);
}

async function fetchProjectsBase(viewer: ViewerSession) {
  const supabase = createAdminClient();
  const filter = viewer.role === 'client' ? { client_id: viewer.userId } : { provider_id: viewer.userId };
  const { data, error } = await supabase.from('projects').select('*').match(filter).order('updated_at', { ascending: false });
  assertError(error);
  return (data ?? []).map(mapProject);
}

async function fetchUsersByIds(userIds: string[]) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map<string, User>();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('users').select('*').in('id', uniqueIds);
  assertError(error);
  return new Map(
    (data ?? []).map((row: any) => {
      const user = mapUser(row);
      return [user.id, user] as const;
    })
  );
}

async function fetchProviderProfilesByUserIds(userIds: string[]) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map<string, ProviderProfile>();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('provider_profiles').select('*').in('user_id', uniqueIds);
  if (isProviderProfilesUnavailable(error)) {
    return new Map<string, ProviderProfile>();
  }

  assertError(error);
  return new Map(
    (data ?? []).map((row: any) => {
      const profile = mapProviderProfile(row);
      return [profile.userId, profile] as const;
    })
  );
}

async function fetchMilestones(projectIds: string[]) {
  if (projectIds.length === 0) {
    return [] as Milestone[];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('milestones').select('*').in('project_id', projectIds).order('order_index', { ascending: true });
  assertError(error);
  return (data ?? []).map(mapMilestone);
}

async function fetchChangeOrders(projectIds: string[]) {
  if (projectIds.length === 0) {
    return [] as ChangeOrder[];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('change_orders').select('*').in('project_id', projectIds).order('created_at', { ascending: false });
  assertError(error);
  return (data ?? []).map(mapChangeOrder);
}

async function fetchTransactions(projectIds: string[]) {
  if (projectIds.length === 0) {
    return [] as Transaction[];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('transactions').select('*').in('project_id', projectIds).order('created_at', { ascending: false });
  assertError(error);
  return (data ?? []).map(mapTransaction);
}

function composeProjectDetails(
  projects: Project[],
  users: Map<string, User>,
  providerProfiles: Map<string, ProviderProfile>,
  milestones: Milestone[],
  changeOrders: ChangeOrder[],
  transactions: Transaction[]
) {
  return projects.map((project) => ({
    ...project,
    client: users.get(project.clientId)!,
    provider: users.get(project.providerId)!,
    providerProfile: providerProfiles.get(project.providerId) ?? null,
    milestones: milestones.filter((item) => item.projectId === project.id),
    changeOrders: changeOrders.filter((item) => item.projectId === project.id),
    transactions: transactions.filter((item) => item.projectId === project.id)
  } satisfies ProjectDetail));
}

async function getAuthorizedProject(projectId: string, viewer?: ViewerSession) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
  assertError(error);
  const project = mapProject(data);

  if (viewer && project.clientId !== viewer.userId && project.providerId !== viewer.userId) {
    throw new Error('You do not have access to this project');
  }

  return project;
}

async function resolveProviderByIdentifier(identifier: string) {
  const supabase = createAdminClient();
  const trimmed = identifier.trim();

  if (!trimmed) {
    throw new Error('Provider lookup is required');
  }

  if (trimmed.includes('@') && trimmed.includes('.')) {
    const { data: providerByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', trimmed.toLowerCase())
      .eq('role', 'provider')
      .maybeSingle();
    if (emailError) {
      throw emailError;
    }
    if (providerByEmail) {
      return mapUser(providerByEmail);
    }
  }

  const normalizedHandle = normalizeHandle(trimmed);
  const profileFilters = [
    normalizedHandle ? 'handle.eq.' + normalizedHandle : '',
    'provider_code.eq.' + trimmed.toUpperCase()
  ].filter(Boolean);

  const { data: profile, error: profileError } = await supabase
    .from('provider_profiles')
    .select('*')
    .or(profileFilters.join(','))
    .maybeSingle();

  if (isProviderProfilesUnavailable(profileError)) {
    throw new Error(getProviderProfilesUnavailableMessage());
  }

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error('Provider not found. Ask the provider to create a profile first or use their exact signup email.');
  }

  const { data: providerRow, error: userError } = await supabase.from('users').select('*').eq('id', profile.user_id).eq('role', 'provider').single();
  assertError(userError);
  return mapUser(providerRow);
}

export async function getProviderProfile(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('provider_profiles').select('*').eq('user_id', userId).maybeSingle();
  if (isProviderProfilesUnavailable(error)) {
    return null;
  }

  if (error) {
    throw error;
  }

  return data ? mapProviderProfile(data) : null;
}

export async function searchProviders(query: string): Promise<ProviderSearchResult[]> {
  const trimmed = sanitizeSearchValue(query);
  if (trimmed.length < 2) {
    return [];
  }

  const normalizedHandle = normalizeHandle(trimmed);
  const supabase = createAdminClient();
  const results = new Map<string, ProviderSearchResult>();

  const { data: userRows, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'provider')
    .or('full_name.ilike.%' + trimmed + '%,email.ilike.%' + trimmed + '%')
    .limit(6);
  assertError(userError);

  const users = (userRows ?? []).map(mapUser);
  users.forEach((user) => {
    results.set(user.id, toProviderSearchResult(user));
  });

  const profileFilters = [
    normalizedHandle ? 'handle.ilike.%' + normalizedHandle + '%' : '',
    'provider_code.ilike.%' + trimmed.toUpperCase() + '%',
    'specialty.ilike.%' + trimmed + '%',
    'bio.ilike.%' + trimmed + '%'
  ].filter(Boolean);

  if (profileFilters.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from('provider_profiles')
      .select('*')
      .or(profileFilters.join(','))
      .limit(8);

    if (!isProviderProfilesUnavailable(profileError)) {
      assertError(profileError);
      const profiles = (profileRows ?? []).map(mapProviderProfile);
      const missingUserIds = profiles.map((profile) => profile.userId).filter((userId) => !results.has(userId));
      const missingUsers = await fetchUsersByIds(missingUserIds);

      profiles.forEach((profile) => {
        const user = users.find((entry) => entry.id === profile.userId) ?? missingUsers.get(profile.userId);
        if (user) {
          results.set(user.id, toProviderSearchResult(user, profile));
        }
      });
    }
  }

  return [...results.values()]
    .sort((left, right) => {
      const leftScore = Number(Boolean(left.handle)) + Number(Boolean(left.providerCode));
      const rightScore = Number(Boolean(right.handle)) + Number(Boolean(right.providerCode));
      return rightScore - leftScore || left.fullName.localeCompare(right.fullName);
    })
    .slice(0, 8);
}

export async function upsertProviderProfile(input: ProviderProfileInput, viewer: ViewerSession) {
  if (viewer.role !== 'provider') {
    throw new Error('Only providers can manage provider profiles');
  }

  const supabase = createAdminClient();
  const existingProfile = await getProviderProfile(viewer.userId);
  const handle = normalizeHandle(input.handle);
  if (!handle) {
    throw new Error('Handle is required');
  }

  const providerCode = existingProfile?.providerCode ?? createProviderCode(viewer.userId);
  const { data, error } = await supabase
    .from('provider_profiles')
    .upsert(
      {
        user_id: viewer.userId,
        handle,
        provider_code: providerCode,
        bio: input.bio,
        country: input.country,
        specialty: input.specialty,
        preferred_payout_channel: input.preferredPayoutChannel,
        availability_status: input.availabilityStatus
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  if (isProviderProfilesUnavailable(error)) {
    throw new Error('Provider profiles are not ready in Supabase yet. Apply the latest migration, wait for the schema cache to refresh, and try again.');
  }

  assertError(error);
  return mapProviderProfile(data);
}

export async function listProjects(viewer: ViewerSession): Promise<ProjectDetail[]> {
  const projects = await fetchProjectsBase(viewer);
  const projectIds = projects.map((project) => project.id);
  const [users, providerProfiles, milestones, changeOrders, transactions] = await Promise.all([
    fetchUsersByIds(projects.flatMap((project) => [project.clientId, project.providerId])),
    fetchProviderProfilesByUserIds(projects.map((project) => project.providerId)),
    fetchMilestones(projectIds),
    fetchChangeOrders(projectIds),
    fetchTransactions(projectIds)
  ]);

  return composeProjectDetails(projects, users, providerProfiles, milestones, changeOrders, transactions);
}

export async function hydrateProject(projectId: string, viewer?: ViewerSession): Promise<ProjectDetail> {
  const project = await getAuthorizedProject(projectId, viewer);
  const [users, providerProfiles, milestones, changeOrders, transactions] = await Promise.all([
    fetchUsersByIds([project.clientId, project.providerId]),
    fetchProviderProfilesByUserIds([project.providerId]),
    fetchMilestones([project.id]),
    fetchChangeOrders([project.id]),
    fetchTransactions([project.id])
  ]);

  return composeProjectDetails([project], users, providerProfiles, milestones, changeOrders, transactions)[0];
}

export async function getDashboardSummary(viewer: ViewerSession): Promise<DashboardSummary> {
  const projects = await listProjects(viewer);
  const notifications = await listNotifications(viewer.userId);
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

export async function getProviderDashboardSnapshot(viewer: ViewerSession): Promise<ProviderDashboardSnapshot> {
  if (viewer.role !== 'provider') {
    throw new Error('Only providers can access provider dashboard insights');
  }

  const projects = await listProjects(viewer);
  const releasedUsd = projects
    .flatMap((project) => project.milestones)
    .filter((milestone) => milestone.status === 'released')
    .reduce((sum, milestone) => sum + milestone.amountUsd, 0);
  const pendingDeliveries = projects
    .flatMap((project) => project.milestones)
    .filter((milestone) => milestone.status === 'funded' && !milestone.confirmedAt).length;
  const awaitingFunding = projects.filter((project) => project.status === 'draft' || project.status === 'funded').length;
  const rateInfo = await getUsdToNgnRate();
  const options = await buildRoutingOptions(Math.max(releasedUsd, 100), isInterswitchConfigured());
  const interswitchRoute = options.find((entry) => entry.platform === 'interswitch') ?? options[0];

  return {
    currentRate: rateInfo.rate,
    rateSource: rateInfo.source,
    bestRouteLabel: 'Interswitch',
    bestRouteAmountNgn: interswitchRoute.amountNgn,
    awaitingFunding,
    pendingDeliveries,
    releasedUsd
  };
}

export async function listNotifications(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  assertError(error);
  return (data ?? []).map(mapNotification);
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId).eq('user_id', userId).select('*').single();
  assertError(error);
  return mapNotification(data);
}

export async function createProject(input: CreateProjectInput, viewer: ViewerSession) {
  if (viewer.role !== 'client') {
    throw new Error('Only clients can create projects');
  }

  const provider = await resolveProviderByIdentifier(input.providerIdentifier);
  const totalAmountUsd = input.milestones.reduce((sum, milestone) => sum + milestone.amountUsd, 0);
  const supabase = createAdminClient();
  const { data: projectRow, error: projectError } = await supabase
    .from('projects')
    .insert({
      title: input.title,
      description: input.description,
      client_id: viewer.userId,
      provider_id: provider.id,
      total_amount_usd: totalAmountUsd,
      status: 'draft'
    })
    .select('*')
    .single();
  assertError(projectError);

  const milestoneRows = input.milestones.map((milestone, index) => ({
    project_id: projectRow.id,
    title: milestone.title,
    description: milestone.description,
    amount_usd: milestone.amountUsd,
    status: 'pending',
    due_date: milestone.dueDate || null,
    order_index: index + 1
  }));
  const { error: milestoneError } = await supabase.from('milestones').insert(milestoneRows);
  assertError(milestoneError);

  await Promise.all([
    notify(provider.id, 'New project invite received: ' + input.title + '.', '/dashboard/projects/' + projectRow.id),
    notify(viewer.userId, 'Project created in draft: ' + input.title + '.', '/dashboard/projects/' + projectRow.id)
  ]);

  return hydrateProject(projectRow.id, viewer);
}

export async function fundProject(projectId: string, viewer: ViewerSession) {
  const project = await getAuthorizedProject(projectId, viewer);
  if (viewer.role !== 'client' || project.clientId !== viewer.userId) {
    throw new Error('Only the client can fund this project');
  }

  if (project.status === 'completed' || project.status === 'disputed') {
    throw new Error('This project can no longer be funded.');
  }

  const supabase = createAdminClient();
  const { data: milestoneRows, error: milestoneError } = await supabase.from('milestones').select('*').eq('project_id', projectId);
  assertError(milestoneError);
  const milestones = (milestoneRows ?? []).map(mapMilestone);

  if (milestones.length === 0) {
    throw new Error('Add milestones before funding escrow.');
  }

  const alreadyFunded = milestones.every((milestone) => milestone.status !== 'pending');
  if (alreadyFunded) {
    throw new Error('Escrow is already funded for this project.');
  }

  const interswitchReference = createDemoInterswitchReference('DEP');
  const { error: milestoneUpdateError } = await supabase
    .from('milestones')
    .update({ status: 'funded' })
    .eq('project_id', projectId)
    .eq('status', 'pending');
  assertError(milestoneUpdateError);

  const nextStatus = project.status === 'in_progress' ? 'in_progress' : 'funded';
  const { error: projectError } = await supabase.from('projects').update({ status: nextStatus }).eq('id', projectId);
  assertError(projectError);

  const { error: transactionError } = await supabase.from('transactions').insert({
    project_id: projectId,
    milestone_id: null,
    type: 'deposit',
    amount_usd: project.totalAmountUsd,
    status: 'completed',
    interswitch_reference: interswitchReference
  });
  assertError(transactionError);

  await Promise.all([
    notify(project.clientId, 'Escrow funded via demo Interswitch flow for ' + project.title + '.', '/dashboard/projects/' + projectId),
    notify(project.providerId, 'Escrow funded and ready for work on ' + project.title + '.', '/dashboard/projects/' + projectId)
  ]);

  return hydrateProject(projectId, viewer);
}

export async function acceptProject(projectId: string, viewer: ViewerSession) {
  const project = await getAuthorizedProject(projectId, viewer);
  if (viewer.role !== 'provider' || project.providerId !== viewer.userId) {
    throw new Error('Only the provider can approve this project');
  }

  if (project.status !== 'draft' && project.status !== 'funded') {
    throw new Error('This project is no longer awaiting provider approval.');
  }

  const supabase = createAdminClient();
  const nextStatus = project.status === 'funded' ? 'in_progress' : 'in_progress';
  const { error } = await supabase.from('projects').update({ status: nextStatus }).eq('id', projectId);
  assertError(error);

  await Promise.all([
    notify(project.providerId, 'You approved ' + project.title + '.', '/dashboard/projects/' + projectId),
    notify(project.clientId, 'Provider approved ' + project.title + ' and work can move forward.', '/dashboard/projects/' + projectId)
  ]);

  return hydrateProject(projectId, viewer);
}

export async function startProject(projectId: string, viewer: ViewerSession) {
  const project = await getAuthorizedProject(projectId, viewer);
  if (viewer.role !== 'client' || project.clientId !== viewer.userId) {
    throw new Error('Only the client can start the project');
  }

  if (project.status !== 'funded') {
    throw new Error('Project must be funded first');
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('projects').update({ status: 'in_progress' }).eq('id', projectId);
  assertError(error);
  await notify(project.providerId, 'Work can begin on ' + project.title + '.', '/dashboard/projects/' + projectId);
  return hydrateProject(projectId, viewer);
}

export async function raiseDispute(projectId: string, viewer: ViewerSession) {
  const project = await getAuthorizedProject(projectId, viewer);
  const supabase = createAdminClient();
  const { error } = await supabase.from('projects').update({ status: 'disputed' }).eq('id', projectId);
  assertError(error);
  await Promise.all([
    notify(project.clientId, 'Dispute raised on ' + project.title + '.', '/dashboard/projects/' + projectId),
    notify(project.providerId, 'Dispute raised on ' + project.title + '.', '/dashboard/projects/' + projectId)
  ]);
  return hydrateProject(projectId, viewer);
}

export async function confirmMilestoneReached(projectId: string, milestoneId: string, viewer: ViewerSession) {
  const project = await getAuthorizedProject(projectId, viewer);
  if (viewer.role !== 'client' || project.clientId !== viewer.userId) {
    throw new Error('Only the client can confirm milestone completion');
  }

  const supabase = createAdminClient();
  const timestamp = new Date().toISOString();
  const { data, error } = await supabase
    .from('milestones')
    .update({ delivered_at: timestamp, confirmed_at: timestamp })
    .eq('id', milestoneId)
    .eq('project_id', projectId)
    .select('*')
    .single();

  if (isMilestoneConfirmationUnavailable(error)) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('milestones')
      .update({ delivered_at: timestamp })
      .eq('id', milestoneId)
      .eq('project_id', projectId)
      .select('*')
      .single();
    assertError(fallbackError);

    await notify(project.providerId, fallbackData.title + ' was acknowledged by the client and is ready for release.', '/dashboard/projects/' + projectId);
    return mapMilestone(fallbackData);
  }

  assertError(error);

  await notify(project.providerId, data.title + ' was acknowledged by the client and is ready for release.', '/dashboard/projects/' + projectId);
  return mapMilestone(data);
}

export async function releaseMilestone(projectId: string, milestoneId: string, viewer: ViewerSession) {
  const project = await getAuthorizedProject(projectId, viewer);
  if (viewer.role !== 'client' || project.clientId !== viewer.userId) {
    throw new Error('Only the client can release milestone funds');
  }

  const supabase = createAdminClient();
  const { data: currentMilestoneRow, error: currentMilestoneError } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', milestoneId)
    .eq('project_id', projectId)
    .single();
  assertError(currentMilestoneError);

  const currentMilestone = mapMilestone(currentMilestoneRow);
  if (!currentMilestone.confirmedAt) {
    throw new Error('Confirm the milestone has been reached before releasing funds.');
  }

  const { data: milestoneRow, error: milestoneError } = await supabase
    .from('milestones')
    .update({ status: 'released' })
    .eq('id', milestoneId)
    .eq('project_id', projectId)
    .select('*')
    .single();
  assertError(milestoneError);

  const milestone = mapMilestone(milestoneRow);
  const { error: transactionError } = await supabase.from('transactions').insert({
    project_id: projectId,
    milestone_id: milestoneId,
    type: 'release',
    amount_usd: milestone.amountUsd,
    status: 'completed',
    interswitch_reference: null
  });
  assertError(transactionError);

  const refreshed = await hydrateProject(projectId, viewer);
  const nextStatus = refreshed.milestones.every((entry) => entry.status === 'released') ? 'completed' : 'in_progress';
  await supabase.from('projects').update({ status: nextStatus }).eq('id', projectId);
  await notify(project.providerId, 'Milestone released: ' + milestone.title + '.', '/dashboard/projects/' + projectId + '/payout');
  return milestone;
}

export async function submitChangeOrder(projectId: string, input: ChangeOrderInput, viewer: ViewerSession) {
  const project = await getAuthorizedProject(projectId, viewer);
  const supabase = createAdminClient();
  const { data: milestoneRows, error: milestoneError } = await supabase.from('milestones').select('*').eq('project_id', projectId).in('id', input.milestoneIds);
  assertError(milestoneError);
  const milestones = (milestoneRows ?? []).map(mapMilestone);
  const originalAmountUsd = milestones.reduce((sum, milestone) => sum + milestone.amountUsd, 0);

  const { data, error } = await supabase
    .from('change_orders')
    .insert({
      project_id: projectId,
      requested_by: viewer.userId,
      original_amount_usd: originalAmountUsd,
      new_amount_usd: input.newAmountUsd,
      reason: input.reason,
      milestone_ids: input.milestoneIds,
      status: 'pending',
      client_approved_at: viewer.role === 'client' ? new Date().toISOString() : null,
      provider_approved_at: viewer.role === 'provider' ? new Date().toISOString() : null
    })
    .select('*')
    .single();
  assertError(error);

  await supabase.from('projects').update({ status: 'change_requested' }).eq('id', projectId);
  const approverId = viewer.role === 'client' ? project.providerId : project.clientId;
  await notify(approverId, 'Change order awaiting your approval on ' + project.title + '.', '/dashboard/projects/' + projectId);
  return mapChangeOrder(data);
}

export async function respondToChangeOrder(projectId: string, changeOrderId: string, viewer: ViewerSession, decision: 'approve' | 'reject') {
  const project = await getAuthorizedProject(projectId, viewer);
  const supabase = createAdminClient();
  const { data: row, error } = await supabase.from('change_orders').select('*').eq('id', changeOrderId).eq('project_id', projectId).single();
  assertError(error);
  const changeOrder = mapChangeOrder(row);

  if (decision === 'reject') {
    const { data, error: rejectError } = await supabase
      .from('change_orders')
      .update({ status: 'rejected' })
      .eq('id', changeOrderId)
      .select('*')
      .single();
    assertError(rejectError);
    await supabase.from('projects').update({ status: 'in_progress' }).eq('id', projectId);
    await Promise.all([
      notify(project.clientId, 'A change order was rejected on ' + project.title + '.', '/dashboard/projects/' + projectId),
      notify(project.providerId, 'A change order was rejected on ' + project.title + '.', '/dashboard/projects/' + projectId)
    ]);
    return mapChangeOrder(data);
  }

  const updatePayload: Record<string, unknown> = {};
  if (viewer.role === 'client') {
    updatePayload.client_approved_at = changeOrder.clientApprovedAt ?? new Date().toISOString();
    updatePayload.status = 'approved_client';
  } else {
    updatePayload.provider_approved_at = changeOrder.providerApprovedAt ?? new Date().toISOString();
    updatePayload.status = 'approved_provider';
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from('change_orders')
    .update(updatePayload)
    .eq('id', changeOrderId)
    .select('*')
    .single();
  assertError(updateError);
  const updated = mapChangeOrder(updatedRow);

  if (updated.clientApprovedAt && updated.providerApprovedAt) {
    const { data: milestoneRows, error: milestoneError } = await supabase.from('milestones').select('*').in('id', updated.milestoneIds).order('order_index', { ascending: true });
    assertError(milestoneError);
    const milestones = (milestoneRows ?? []).map(mapMilestone);
    const currentTotal = milestones.reduce((sum, milestone) => sum + milestone.amountUsd, 0);
    const delta = updated.newAmountUsd - currentTotal;

    if (milestones.length > 0) {
      const finalMilestone = milestones[milestones.length - 1];
      await supabase.from('milestones').update({ amount_usd: finalMilestone.amountUsd + delta }).eq('id', finalMilestone.id);
    }

    await supabase.from('projects').update({ total_amount_usd: project.totalAmountUsd + delta, status: 'in_progress' }).eq('id', projectId);
    await supabase.from('change_orders').update({ status: 'fully_approved' }).eq('id', changeOrderId);
    await supabase.from('transactions').insert({
      project_id: projectId,
      milestone_id: updated.milestoneIds[updated.milestoneIds.length - 1] ?? null,
      type: 'change_top_up',
      amount_usd: Math.max(delta, 0),
      status: delta > 0 ? 'pending' : 'completed',
      interswitch_reference: null
    });
    await Promise.all([
      notify(project.clientId, 'Change order fully approved for ' + project.title + '.', '/dashboard/projects/' + projectId),
      notify(project.providerId, 'Change order fully approved for ' + project.title + '.', '/dashboard/projects/' + projectId)
    ]);

    const { data: finalRow, error: finalError } = await supabase.from('change_orders').select('*').eq('id', changeOrderId).single();
    assertError(finalError);
    return mapChangeOrder(finalRow);
  }

  return updated;
}

export async function getRoutingOptions(projectId: string, viewer: ViewerSession): Promise<RoutingOption[]> {
  const project = await hydrateProject(projectId, viewer);
  if (viewer.role !== 'provider' || project.providerId !== viewer.userId) {
    throw new Error('Only the provider can view payout timing');
  }

  const amountUsd = project.milestones.filter((entry) => entry.status === 'released').reduce((sum, milestone) => sum + milestone.amountUsd, 0);
  return buildRoutingOptions(amountUsd, isInterswitchConfigured());
}

export async function logPayoutSelection(projectId: string, viewer: ViewerSession, platform: PayoutPlatform) {
  const project = await getAuthorizedProject(projectId, viewer);
  if (viewer.role !== 'provider' || project.providerId !== viewer.userId) {
    throw new Error('Only the provider can log payout selections');
  }

  const option = (await getRoutingOptions(projectId, viewer)).find((entry) => entry.platform === platform);
  if (!option) {
    throw new Error('Routing option not found');
  }

  if (platform === 'interswitch' && !isInterswitchConfigured()) {
    throw new Error('Interswitch payout is not available until your account is activated.');
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('payout_requests')
    .insert({
      provider_id: viewer.userId,
      project_id: projectId,
      amount_usd: option.amountUsd,
      selected_platform: platform,
      rate_at_time_ngn: option.rate,
      amount_ngn: option.amountNgn,
      status: platform === 'interswitch' ? 'processing' : 'pending'
    })
    .select('*')
    .single();
  assertError(error);

  await notify(viewer.userId, 'Payout route logged via ' + option.label + '.', '/dashboard/projects/' + projectId + '/payout');
  return mapPayoutRequest(data);
}

export async function listPayoutRequests(projectId: string, viewer: ViewerSession) {
  const project = await getAuthorizedProject(projectId, viewer);
  if (viewer.userId !== project.providerId) {
    throw new Error('Only the provider can view payout requests');
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('payout_requests').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
  assertError(error);
  return (data ?? []).map(mapPayoutRequest);
}


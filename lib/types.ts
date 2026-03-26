export type Role = 'client' | 'provider';

export type ProjectStatus =
  | 'draft'
  | 'funded'
  | 'in_progress'
  | 'change_requested'
  | 'completed'
  | 'disputed';

export type MilestoneStatus = 'pending' | 'funded' | 'released';
export type TransactionType = 'deposit' | 'release' | 'change_top_up';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type ChangeOrderStatus =
  | 'pending'
  | 'approved_client'
  | 'approved_provider'
  | 'fully_approved'
  | 'rejected';
export type PayoutPlatform = 'interswitch' | 'wise' | 'grey' | 'payoneer' | 'quidax';
export type PayoutStatus = 'pending' | 'processing' | 'completed';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  handle: string;
  providerCode: string;
  bio: string;
  country: string;
  specialty: string;
  preferredPayoutChannel: string;
  availabilityStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderSearchResult {
  userId: string;
  fullName: string;
  email: string;
  handle: string | null;
  providerCode: string | null;
  specialty: string | null;
  availabilityStatus: string | null;
  preferredPayoutChannel: string | null;
  bio: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  providerId: string;
  totalAmountUsd: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amountUsd: number;
  status: MilestoneStatus;
  dueDate: string | null;
  orderIndex: number;
  deliveredAt: string | null;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  requestedBy: string;
  originalAmountUsd: number;
  newAmountUsd: number;
  reason: string;
  milestoneIds: string[];
  status: ChangeOrderStatus;
  clientApprovedAt: string | null;
  providerApprovedAt: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  projectId: string;
  milestoneId: string | null;
  type: TransactionType;
  amountUsd: number;
  status: TransactionStatus;
  interswitchReference: string | null;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  providerId: string;
  projectId: string;
  amountUsd: number;
  selectedPlatform: PayoutPlatform;
  rateAtTimeNgn: number;
  amountNgn: number;
  status: PayoutStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: string;
}

export interface ViewerSession {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface ProjectDetail extends Project {
  client: User;
  provider: User;
  providerProfile: ProviderProfile | null;
  milestones: Milestone[];
  changeOrders: ChangeOrder[];
  transactions: Transaction[];
}

export interface DashboardSummary {
  activeProjects: number;
  changeRequests: number;
  unreadNotifications: number;
  releasedUsd: number;
}

export interface ProviderDashboardSnapshot {
  currentRate: number;
  rateSource: 'monierate' | 'fallback';
  bestRouteLabel: string;
  bestRouteAmountNgn: number;
  awaitingFunding: number;
  pendingDeliveries: number;
  releasedUsd: number;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  providerIdentifier: string;
  milestones: Array<{
    title: string;
    description: string;
    amountUsd: number;
    dueDate?: string;
  }>;
}

export interface ProviderProfileInput {
  handle: string;
  bio: string;
  country: string;
  specialty: string;
  preferredPayoutChannel: string;
  availabilityStatus: string;
}

export interface ChangeOrderInput {
  milestoneIds: string[];
  newAmountUsd: number;
  reason: string;
}

export interface RoutingOption {
  platform: PayoutPlatform;
  label: string;
  source: 'monierate' | 'interswitch' | 'fallback';
  rate: number;
  feeLabel: string;
  feeUsd: number;
  amountUsd: number;
  amountNgn: number;
  processingTime: string;
  isBestValue: boolean;
  isRecommended: boolean;
  isAvailable: boolean;
  note: string;
}


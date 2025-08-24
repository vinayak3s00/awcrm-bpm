// AWCRM Deal Types
// Type definitions for comprehensive deal/opportunity management

export type DealStage = 'prospecting' | 'qualification' | 'needs_analysis' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource = 'website' | 'referral' | 'social_media' | 'email_campaign' | 'conference' | 'cold_call' | 'advertisement' | 'partner' | 'other';

export interface Deal {
  id: string;
  title: string;
  description?: string;
  stage: DealStage;
  value: number; // in cents
  probability: number; // percentage 0-100
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  priority: Priority;
  source: LeadSource;
  tags: string[];
  customFields: Record<string, any>;
  notes?: string;
  companyId?: string;
  contactId?: string;
  leadId?: string;
  ownerId?: string;
  createdBy: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDealData {
  title: string;
  description?: string;
  stage?: DealStage;
  value: number;
  probability?: number;
  expectedCloseDate?: Date;
  priority?: Priority;
  source?: LeadSource;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
  companyId?: string;
  contactId?: string;
  leadId?: string;
  ownerId?: string;
}

export interface UpdateDealData extends Partial<CreateDealData> {
  id: string;
  actualCloseDate?: Date;
}

export interface DealFilters {
  stage?: DealStage;
  priority?: Priority;
  source?: LeadSource;
  ownerId?: string;
  companyId?: string;
  search?: string;
  minValue?: number;
  maxValue?: number;
  expectedCloseDateFrom?: Date;
  expectedCloseDateTo?: Date;
  probability?: number;
}

export interface DealListParams {
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'value' | 'probability' | 'expectedCloseDate' | 'stage' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  filters?: DealFilters;
}

export interface DealListResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Deal form validation schemas
export interface DealFormData {
  title: string;
  description: string;
  stage: DealStage;
  value: number;
  probability: number;
  expectedCloseDate: Date | null;
  priority: Priority;
  source: LeadSource;
  tags: string[];
  notes: string;
  companyId: string;
  contactId: string;
  ownerId: string;
}

// Deal pipeline
export interface PipelineStage {
  stage: DealStage;
  label: string;
  color: string;
  count: number;
  value: number;
  averageProbability: number;
  averageDealSize: number;
  deals: Deal[];
}

export interface Pipeline {
  stages: PipelineStage[];
  totalValue: number;
  totalDeals: number;
  averageDealSize: number;
  conversionRate: number;
}

// Deal analytics
export interface DealStats {
  total: number;
  totalValue: number;
  averageValue: number;
  byStage: Record<DealStage, { count: number; value: number }>;
  byPriority: Record<Priority, number>;
  bySource: Record<LeadSource, number>;
  conversionRate: number;
  averageDealTime: number; // in days
  wonDeals: number;
  lostDeals: number;
  monthlyTrend: {
    month: string;
    deals: number;
    value: number;
    won: number;
    lost: number;
  }[];
}

// Deal activities and history
export interface DealActivity {
  id: string;
  dealId: string;
  type: 'stage_change' | 'value_change' | 'probability_change' | 'note_added' | 'task_completed' | 'meeting_scheduled';
  subject: string;
  description?: string;
  oldValue?: any;
  newValue?: any;
  createdBy: string;
  createdAt: Date;
}

export interface DealHistory {
  activities: DealActivity[];
  stageHistory: {
    stage: DealStage;
    enteredAt: Date;
    exitedAt?: Date;
    duration?: number; // in days
  }[];
  valueHistory: {
    value: number;
    changedAt: Date;
    changedBy: string;
  }[];
}

// Deal forecasting
export interface DealForecast {
  period: 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  projectedValue: number;
  weightedValue: number; // value * probability
  bestCase: number;
  worstCase: number;
  deals: {
    deal: Deal;
    weightedValue: number;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

// Deal insights and recommendations
export interface DealInsight {
  type: 'at_risk' | 'opportunity' | 'stalled' | 'hot_prospect';
  title: string;
  description: string;
  dealId: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  createdAt: Date;
}

// Deal collaboration
export interface DealTeamMember {
  userId: string;
  role: 'owner' | 'collaborator' | 'viewer';
  permissions: string[];
  addedAt: Date;
}

export interface DealNote {
  id: string;
  content: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
}

// Deal products and line items
export interface DealProduct {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in cents
  totalPrice: number; // in cents
  discount?: number; // percentage
  category?: string;
}

export interface DealQuote {
  id: string;
  dealId: string;
  version: number;
  products: DealProduct[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil?: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
}

// Deal reporting
export interface DealReport {
  title: string;
  description: string;
  filters: DealFilters;
  metrics: {
    totalDeals: number;
    totalValue: number;
    averageValue: number;
    conversionRate: number;
    averageSalesTime: number;
  };
  charts: {
    type: 'bar' | 'line' | 'pie' | 'funnel';
    data: any[];
    labels: string[];
  }[];
  generatedAt: Date;
}

// Deal export/import
export interface DealExportData {
  deals: Deal[];
  activities: DealActivity[];
  notes: DealNote[];
  tasks: DealTask[];
}

export interface DealImportMapping {
  title: string;
  value: string;
  stage?: string;
  probability?: string;
  expectedCloseDate?: string;
  companyName?: string;
  contactEmail?: string;
  ownerEmail?: string;
}

// Deal automation
export interface DealAutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'stage_change' | 'value_change' | 'date_reached' | 'inactivity';
    conditions: Record<string, any>;
  };
  actions: {
    type: 'send_email' | 'create_task' | 'update_field' | 'notify_user';
    parameters: Record<string, any>;
  }[];
  isActive: boolean;
  createdAt: Date;
}

// Deal integration
export interface DealIntegrationData {
  source: 'manual' | 'import' | 'api' | 'lead_conversion';
  externalId?: string;
  lastSyncAt?: Date;
  syncStatus: 'pending' | 'synced' | 'error';
  metadata?: Record<string, any>;
}

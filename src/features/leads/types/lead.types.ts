// AWCRM Lead Types
// Type definitions for lead management system

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type LeadSource = 'website' | 'referral' | 'social_media' | 'email_campaign' | 'conference' | 'cold_call' | 'advertisement' | 'partner' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: Priority;
  estimatedValue?: number; // in cents
  probability: number; // percentage 0-100
  expectedCloseDate?: Date;
  tags: string[];
  customFields: Record<string, any>;
  notes?: string;
  contactId?: string;
  assignedTo?: string;
  createdBy: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadData {
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status?: LeadStatus;
  source?: LeadSource;
  priority?: Priority;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: Date;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
  contactId?: string;
  assignedTo?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  id: string;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  priority?: Priority;
  assignedTo?: string;
  company?: string;
  search?: string;
  minValue?: number;
  maxValue?: number;
  expectedCloseDateFrom?: Date;
  expectedCloseDateTo?: Date;
}

export interface LeadListParams {
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'firstName' | 'lastName' | 'company' | 'estimatedValue' | 'probability' | 'expectedCloseDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  filters?: LeadFilters;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Lead form validation schemas
export interface LeadFormData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: LeadStatus;
  source: LeadSource;
  priority: Priority;
  estimatedValue: number;
  probability: number;
  expectedCloseDate: Date | null;
  tags: string[];
  notes: string;
  assignedTo: string;
}

// Lead activity types
export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'value_change';
  subject: string;
  description?: string;
  oldValue?: any;
  newValue?: any;
  createdBy: string;
  createdAt: Date;
}

// Lead statistics
export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  bySource: Record<LeadSource, number>;
  byPriority: Record<Priority, number>;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
  averageDealTime: number; // in days
}

// Lead pipeline stage
export interface PipelineStage {
  status: LeadStatus;
  label: string;
  color: string;
  count: number;
  value: number;
  probability: number;
}

// Lead conversion
export interface LeadConversion {
  leadId: string;
  contactId: string;
  convertedAt: Date;
  convertedBy: string;
  notes?: string;
}

// AWCRM Company Types
// Type definitions for comprehensive company/account management

export type CompanyType = 'prospect' | 'customer' | 'partner' | 'vendor' | 'competitor';
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type Industry = 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'real_estate' | 'consulting' | 'other';

export interface CompanyAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface CompanySocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  website?: string;
  industry?: Industry;
  companySize?: CompanySize;
  companyType: CompanyType;
  annualRevenue?: number; // in cents
  employeeCount?: number;
  description?: string;
  address: CompanyAddress;
  phone?: string;
  email?: string;
  socialMedia: CompanySocialMedia;
  tags: string[];
  customFields: Record<string, any>;
  notes?: string;
  parentCompanyId?: string;
  ownerId?: string;
  createdBy: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyData {
  name: string;
  domain?: string;
  website?: string;
  industry?: Industry;
  companySize?: CompanySize;
  companyType?: CompanyType;
  annualRevenue?: number;
  employeeCount?: number;
  description?: string;
  address?: CompanyAddress;
  phone?: string;
  email?: string;
  socialMedia?: CompanySocialMedia;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
  parentCompanyId?: string;
  ownerId?: string;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string;
}

export interface CompanyFilters {
  companyType?: CompanyType;
  industry?: Industry;
  companySize?: CompanySize;
  ownerId?: string;
  search?: string;
  minRevenue?: number;
  maxRevenue?: number;
  minEmployees?: number;
  maxEmployees?: number;
  hasWebsite?: boolean;
  tags?: string[];
}

export interface CompanyListParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'industry' | 'companySize' | 'annualRevenue' | 'employeeCount' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  filters?: CompanyFilters;
}

export interface CompanyListResponse {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Company form validation schemas
export interface CompanyFormData {
  name: string;
  domain: string;
  website: string;
  industry: Industry | '';
  companySize: CompanySize | '';
  companyType: CompanyType;
  annualRevenue: number;
  employeeCount: number;
  description: string;
  address: CompanyAddress;
  phone: string;
  email: string;
  socialMedia: CompanySocialMedia;
  tags: string[];
  notes: string;
  ownerId: string;
}

// Company relationships
export interface CompanyContact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  jobTitle?: string;
  isPrimary: boolean;
}

export interface CompanyDeal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate?: Date;
}

export interface CompanyActivity {
  id: string;
  type: string;
  subject: string;
  date: Date;
  contactName?: string;
  dealTitle?: string;
}

export interface CompanyStats {
  totalRevenue: number;
  totalDeals: number;
  totalContacts: number;
  totalActivities: number;
  conversionRate: number;
  averageDealSize: number;
  lastActivity?: Date;
}

// Company hierarchy
export interface CompanyHierarchy {
  id: string;
  name: string;
  companyType: CompanyType;
  children: CompanyHierarchy[];
  level: number;
}

// Company insights
export interface CompanyInsight {
  type: 'revenue_growth' | 'deal_velocity' | 'engagement_score' | 'risk_assessment';
  title: string;
  description: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  severity?: 'low' | 'medium' | 'high';
}

// Company export/import
export interface CompanyExportData {
  companies: Company[];
  contacts: CompanyContact[];
  deals: CompanyDeal[];
  activities: CompanyActivity[];
}

export interface CompanyImportMapping {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Company search and filtering
export interface CompanySearchResult {
  id: string;
  name: string;
  domain?: string;
  industry?: Industry;
  companySize?: CompanySize;
  companyType: CompanyType;
  contactCount: number;
  dealCount: number;
  totalRevenue: number;
  lastActivity?: Date;
}

// Company analytics
export interface CompanyAnalytics {
  totalCompanies: number;
  byType: Record<CompanyType, number>;
  byIndustry: Record<Industry, number>;
  bySize: Record<CompanySize, number>;
  totalRevenue: number;
  averageRevenue: number;
  topCompanies: CompanySearchResult[];
  recentActivity: CompanyActivity[];
}

// Company integration data
export interface CompanyIntegrationData {
  source: 'manual' | 'import' | 'api' | 'enrichment';
  externalId?: string;
  lastSyncAt?: Date;
  syncStatus: 'pending' | 'synced' | 'error';
  enrichmentData?: {
    logo?: string;
    description?: string;
    foundedYear?: number;
    headquarters?: string;
    technologies?: string[];
  };
}

// AWCRM Organization Types
// Type definitions for organization management system

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';
export type UserRole = 'admin' | 'manager' | 'user';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  settings: OrganizationSettings;
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  language?: string;
  features?: {
    contacts?: boolean;
    leads?: boolean;
    deals?: boolean;
    workflows?: boolean;
    analytics?: boolean;
    ai?: boolean;
  };
  customFields?: {
    contacts?: CustomField[];
    leads?: CustomField[];
    deals?: CustomField[];
  };
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[]; // for select/multiselect types
  defaultValue?: any;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  settings?: Partial<OrganizationSettings>;
}

export interface UpdateOrganizationData extends Partial<CreateOrganizationData> {
  id: string;
}

export interface CreateUserData {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: UserRole;
  organizationId?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

export interface OrganizationMember {
  user: User;
  role: UserRole;
  joinedAt: Date;
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  organizationId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

// Organization statistics for dashboard
export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  totalContacts: number;
  totalLeads: number;
  totalDeals: number;
  monthlyGrowth: {
    contacts: number;
    leads: number;
    deals: number;
  };
}

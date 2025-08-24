// AWCRM Contact Types
// Type definitions for contact management system

export type ContactStatus = 'active' | 'inactive' | 'prospect';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: ContactStatus;
  source?: string;
  tags: string[];
  customFields: Record<string, any>;
  notes?: string;
  createdBy: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status?: ContactStatus;
  source?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string;
}

export interface ContactFilters {
  status?: ContactStatus;
  source?: string;
  tags?: string[];
  company?: string;
  search?: string;
  createdBy?: string;
}

export interface ContactListParams {
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'company' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  filters?: ContactFilters;
}

export interface ContactListResponse {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Contact form validation schemas
export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: ContactStatus;
  source: string;
  tags: string[];
  notes: string;
}

// Contact activity types (for future phases)
export interface ContactActivity {
  id: string;
  contactId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
}

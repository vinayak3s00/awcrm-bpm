'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: 'active' | 'inactive' | 'prospect';
  source: string;
  tags: string[];
  customFields: Record<string, any>;
  notes: string;
  companyId?: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  lastActivity?: string;
};

export type ContactFilters = {
  search?: string;
  status?: string;
  source?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type ContactPagination = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type UseContactsResult = {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  pagination: ContactPagination;
  filters: ContactFilters;

  // Actions
  fetchContacts: () => Promise<void>;
  createContact: (data: Partial<Contact>) => Promise<Contact>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  bulkDeleteContacts: (ids: string[]) => Promise<void>;

  // Filters and pagination
  setFilters: (filters: ContactFilters) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Utility
  refreshContacts: () => Promise<void>;
  getContactById: (id: string) => Contact | undefined;
};

export function useContacts(initialFilters: ContactFilters = {}): UseContactsResult {
  const { getToken } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContactFilters>(initialFilters);
  const [pagination, setPagination] = useState<ContactPagination>({
    page: 1,
    limit: 50,
    total: 0,
    hasMore: false,
  });

  // API call helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }, [getToken]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.source && { source: filters.source }),
      });

      const response = await apiCall(`/contacts?${params}`);

      setContacts(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        hasMore: response.pagination?.hasMore || false,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall, filters, pagination.page, pagination.limit]);

  // Create contact
  const createContact = useCallback(async (data: Partial<Contact>): Promise<Contact> => {
    setError(null);

    try {
      const response = await apiCall('/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Add to local state
      setContacts(prev => [response, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create contact';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Update contact
  const updateContact = useCallback(async (id: string, data: Partial<Contact>): Promise<Contact> => {
    setError(null);

    try {
      const response = await apiCall(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      // Update local state
      setContacts(prev => prev.map(contact =>
        contact.id === id ? { ...contact, ...response } : contact,
      ));

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update contact';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Delete contact
  const deleteContact = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      await apiCall(`/contacts/${id}`, {
        method: 'DELETE',
      });

      // Remove from local state
      setContacts(prev => prev.filter(contact => contact.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete contact';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Bulk delete contacts
  const bulkDeleteContacts = useCallback(async (ids: string[]): Promise<void> => {
    setError(null);

    try {
      await apiCall('/contacts/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });

      // Remove from local state
      setContacts(prev => prev.filter(contact => !ids.includes(contact.id)));
      setPagination(prev => ({ ...prev, total: prev.total - ids.length }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete contacts';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Set filters
  const setFiltersCallback = useCallback((newFilters: ContactFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Set limit
  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Refresh contacts
  const refreshContacts = useCallback(async () => {
    await fetchContacts();
  }, [fetchContacts]);

  // Get contact by ID
  const getContactById = useCallback((id: string): Contact | undefined => {
    return contacts.find(contact => contact.id === id);
  }, [contacts]);

  // Fetch contacts when dependencies change
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    pagination,
    filters,

    // Actions
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    bulkDeleteContacts,

    // Filters and pagination
    setFilters: setFiltersCallback,
    setPage,
    setLimit,

    // Utility
    refreshContacts,
    getContactById,
  };
}

'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

export type Company = {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  revenue: string;
  location: string;
  phone: string;
  website: string;
  contactCount: number;
  dealCount: number;
  totalValue: number;
  status: 'active' | 'inactive' | 'prospect';
  lastActivity: string;
  createdAt: string;
  logo?: string;
  organizationId: string;
  createdBy: string;
  updatedAt: string;
};

export type CompanyFilters = {
  search?: string;
  status?: string;
  industry?: string;
  size?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type CompanyPagination = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type UseCompaniesResult = {
  companies: Company[];
  loading: boolean;
  error: string | null;
  pagination: CompanyPagination;
  filters: CompanyFilters;

  // Actions
  fetchCompanies: () => Promise<void>;
  createCompany: (data: Partial<Company>) => Promise<Company>;
  updateCompany: (id: string, data: Partial<Company>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
  bulkDeleteCompanies: (ids: string[]) => Promise<void>;

  // Filters and pagination
  setFilters: (filters: CompanyFilters) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Utility
  refreshCompanies: () => Promise<void>;
  getCompanyById: (id: string) => Company | undefined;
};

export function useCompanies(initialFilters: CompanyFilters = {}): UseCompaniesResult {
  const { getToken } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CompanyFilters>(initialFilters);
  const [pagination, setPagination] = useState<CompanyPagination>({
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

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.industry && { industry: filters.industry }),
        ...(filters.size && { size: filters.size }),
      });

      const response = await apiCall(`/companies?${params}`);

      setCompanies(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        hasMore: response.pagination?.hasMore || false,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall, filters, pagination.page, pagination.limit]);

  // Create company
  const createCompany = useCallback(async (data: Partial<Company>): Promise<Company> => {
    setError(null);

    try {
      const response = await apiCall('/companies', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setCompanies(prev => [response, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create company';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Update company
  const updateCompany = useCallback(async (id: string, data: Partial<Company>): Promise<Company> => {
    setError(null);

    try {
      const response = await apiCall(`/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      setCompanies(prev => prev.map(company =>
        company.id === id ? { ...company, ...response } : company,
      ));

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update company';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Delete company
  const deleteCompany = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      await apiCall(`/companies/${id}`, {
        method: 'DELETE',
      });

      setCompanies(prev => prev.filter(company => company.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete company';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Bulk delete companies
  const bulkDeleteCompanies = useCallback(async (ids: string[]): Promise<void> => {
    setError(null);

    try {
      await apiCall('/companies/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });

      setCompanies(prev => prev.filter(company => !ids.includes(company.id)));
      setPagination(prev => ({ ...prev, total: prev.total - ids.length }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete companies';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Set filters
  const setFiltersCallback = useCallback((newFilters: CompanyFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Set limit
  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Refresh companies
  const refreshCompanies = useCallback(async () => {
    await fetchCompanies();
  }, [fetchCompanies]);

  // Get company by ID
  const getCompanyById = useCallback((id: string): Company | undefined => {
    return companies.find(company => company.id === id);
  }, [companies]);

  // Fetch companies when dependencies change
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    pagination,
    filters,

    // Actions
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    bulkDeleteCompanies,

    // Filters and pagination
    setFilters: setFiltersCallback,
    setPage,
    setLimit,

    // Utility
    refreshCompanies,
    getCompanyById,
  };
}

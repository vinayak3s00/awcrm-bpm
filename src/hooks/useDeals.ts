'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

export type Deal = {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  status: 'open' | 'won' | 'lost';
  description?: string;
  customFields: Record<string, any>;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  companyId?: string;
  companyName?: string;
  companyDomain?: string;
  ownerId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  weightedValue: number;
};

export type DealFilters = {
  search?: string;
  stage?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type DealPagination = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type UseDealsResult = {
  deals: Deal[];
  loading: boolean;
  error: string | null;
  pagination: DealPagination;
  filters: DealFilters;

  // Actions
  fetchDeals: () => Promise<void>;
  createDeal: (data: Partial<Deal>) => Promise<Deal>;
  updateDeal: (id: string, data: Partial<Deal>) => Promise<Deal>;
  deleteDeal: (id: string) => Promise<void>;
  moveDeal: (id: string, newStage: string) => Promise<Deal>;

  // Filters and pagination
  setFilters: (filters: DealFilters) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Utility
  refreshDeals: () => Promise<void>;
  getDealById: (id: string) => Deal | undefined;
  getDealsByStage: (stage: string) => Deal[];
  getPipelineMetrics: () => PipelineMetrics;
};

export type PipelineMetrics = {
  totalValue: number;
  weightedValue: number;
  averageDealSize: number;
  winRate: number;
  dealCount: number;
  stageMetrics: Record<string, {
    count: number;
    value: number;
    averageValue: number;
  }>;
};

export function useDeals(initialFilters: DealFilters = {}): UseDealsResult {
  const { getToken } = useAuth();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DealFilters>(initialFilters);
  const [pagination, setPagination] = useState<DealPagination>({
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

  // Fetch deals
  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.stage && { stage: filters.stage }),
        ...(filters.status && { status: filters.status }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await apiCall(`/deals?${params}`);

      setDeals(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        hasMore: response.pagination?.hasMore || false,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deals');
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall, filters, pagination.page, pagination.limit]);

  // Create deal
  const createDeal = useCallback(async (data: Partial<Deal>): Promise<Deal> => {
    setError(null);

    try {
      const response = await apiCall('/deals', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setDeals(prev => [response, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Update deal
  const updateDeal = useCallback(async (id: string, data: Partial<Deal>): Promise<Deal> => {
    setError(null);

    try {
      const response = await apiCall(`/deals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      setDeals(prev => prev.map(deal =>
        deal.id === id ? { ...deal, ...response } : deal,
      ));

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update deal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Delete deal
  const deleteDeal = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      await apiCall(`/deals/${id}`, {
        method: 'DELETE',
      });

      setDeals(prev => prev.filter(deal => deal.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete deal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiCall]);

  // Move deal to different stage
  const moveDeal = useCallback(async (id: string, newStage: string): Promise<Deal> => {
    return updateDeal(id, { stage: newStage });
  }, [updateDeal]);

  // Set filters
  const setFiltersCallback = useCallback((newFilters: DealFilters) => {
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

  // Refresh deals
  const refreshDeals = useCallback(async () => {
    await fetchDeals();
  }, [fetchDeals]);

  // Get deal by ID
  const getDealById = useCallback((id: string): Deal | undefined => {
    return deals.find(deal => deal.id === id);
  }, [deals]);

  // Get deals by stage
  const getDealsByStage = useCallback((stage: string): Deal[] => {
    return deals.filter(deal => deal.stage === stage);
  }, [deals]);

  // Calculate pipeline metrics
  const getPipelineMetrics = useCallback((): PipelineMetrics => {
    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const weightedValue = deals.reduce((sum, deal) => sum + deal.weightedValue, 0);
    const dealCount = deals.length;
    const averageDealSize = dealCount > 0 ? totalValue / dealCount : 0;

    // Calculate win rate (won deals / closed deals)
    const closedDeals = deals.filter(deal => ['won', 'lost'].includes(deal.status));
    const wonDeals = deals.filter(deal => deal.status === 'won');
    const winRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;

    // Calculate stage metrics
    const stageMetrics: Record<string, { count: number; value: number; averageValue: number }> = {};

    deals.forEach((deal) => {
      if (!stageMetrics[deal.stage]) {
        stageMetrics[deal.stage] = { count: 0, value: 0, averageValue: 0 };
      }
      stageMetrics[deal.stage].count++;
      stageMetrics[deal.stage].value += deal.value || 0;
    });

    // Calculate average values for each stage
    Object.keys(stageMetrics).forEach((stage) => {
      const metrics = stageMetrics[stage];
      metrics.averageValue = metrics.count > 0 ? metrics.value / metrics.count : 0;
    });

    return {
      totalValue,
      weightedValue,
      averageDealSize,
      winRate,
      dealCount,
      stageMetrics,
    };
  }, [deals]);

  // Fetch deals when dependencies change
  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    pagination,
    filters,

    // Actions
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    moveDeal,

    // Filters and pagination
    setFilters: setFiltersCallback,
    setPage,
    setLimit,

    // Utility
    refreshDeals,
    getDealById,
    getDealsByStage,
    getPipelineMetrics,
  };
}

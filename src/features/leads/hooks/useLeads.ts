// AWCRM Leads Hook - Modern React Hook with TanStack Query
// Custom hook for lead management with caching, optimistic updates, and error handling

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Lead,
  CreateLeadData,
  UpdateLeadData,
  LeadListParams,
  LeadListResponse,
} from '../types/lead.types';

// API functions (these would call your actual API endpoints)
const leadsApi = {
  getLeads: async (params: LeadListParams, organizationId: string): Promise<LeadListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params.filters?.search) searchParams.set('search', params.filters.search);
    if (params.filters?.status) searchParams.set('status', params.filters.status);
    if (params.filters?.source) searchParams.set('source', params.filters.source);
    if (params.filters?.priority) searchParams.set('priority', params.filters.priority);
    if (params.filters?.company) searchParams.set('company', params.filters.company);
    if (params.filters?.assignedTo) searchParams.set('assignedTo', params.filters.assignedTo);
    if (params.filters?.minValue !== undefined) searchParams.set('minValue', params.filters.minValue.toString());
    if (params.filters?.maxValue !== undefined) searchParams.set('maxValue', params.filters.maxValue.toString());
    
    const response = await fetch(`/api/leads?${searchParams.toString()}`, {
      headers: {
        'x-organization-id': organizationId,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch leads');
    }
    
    const result = await response.json();
    return result.data;
  },

  getLead: async (id: string, organizationId: string): Promise<Lead> => {
    const response = await fetch(`/api/leads/${id}`, {
      headers: {
        'x-organization-id': organizationId,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch lead');
    }
    
    const result = await response.json();
    return result.data;
  },

  createLead: async (data: CreateLeadData, organizationId: string): Promise<Lead> => {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': organizationId,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create lead');
    }
    
    const result = await response.json();
    return result.data;
  },

  updateLead: async (data: UpdateLeadData, organizationId: string): Promise<Lead> => {
    const response = await fetch(`/api/leads/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': organizationId,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update lead');
    }
    
    const result = await response.json();
    return result.data;
  },

  deleteLead: async (id: string, organizationId: string): Promise<void> => {
    const response = await fetch(`/api/leads/${id}`, {
      method: 'DELETE',
      headers: {
        'x-organization-id': organizationId,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete lead');
    }
  },
};

// Query keys for consistent caching
export const leadsQueryKeys = {
  all: ['leads'] as const,
  lists: () => [...leadsQueryKeys.all, 'list'] as const,
  list: (params: LeadListParams) => [...leadsQueryKeys.lists(), params] as const,
  details: () => [...leadsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadsQueryKeys.details(), id] as const,
  stats: () => [...leadsQueryKeys.all, 'stats'] as const,
};

// Hook for fetching leads list
export function useLeads(params: LeadListParams, organizationId: string) {
  return useQuery({
    queryKey: leadsQueryKeys.list(params),
    queryFn: () => leadsApi.getLeads(params, organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching single lead
export function useLead(id: string, organizationId: string) {
  return useQuery({
    queryKey: leadsQueryKeys.detail(id),
    queryFn: () => leadsApi.getLead(id, organizationId),
    enabled: !!id && !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating lead
export function useCreateLead(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadData) => leadsApi.createLead(data, organizationId),
    onSuccess: (newLead) => {
      // Invalidate and refetch leads list
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      // Add the new lead to the cache
      queryClient.setQueryData(leadsQueryKeys.detail(newLead.id), newLead);
      
      toast.success('Lead created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create lead');
    },
  });
}

// Hook for updating lead
export function useUpdateLead(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLeadData) => leadsApi.updateLead(data, organizationId),
    onSuccess: (updatedLead) => {
      // Update the lead in the cache
      queryClient.setQueryData(leadsQueryKeys.detail(updatedLead.id), updatedLead);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      toast.success('Lead updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update lead');
    },
  });
}

// Hook for deleting lead
export function useDeleteLead(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsApi.deleteLead(id, organizationId),
    onSuccess: (_, deletedId) => {
      // Remove the lead from cache
      queryClient.removeQueries({ queryKey: leadsQueryKeys.detail(deletedId) });
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      toast.success('Lead deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete lead');
    },
  });
}

// Hook for optimistic lead updates (for better UX)
export function useOptimisticUpdateLead(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLeadData) => leadsApi.updateLead(data, organizationId),
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: leadsQueryKeys.detail(data.id) });

      // Snapshot the previous value
      const previousLead = queryClient.getQueryData(leadsQueryKeys.detail(data.id));

      // Optimistically update to the new value
      if (previousLead) {
        queryClient.setQueryData(leadsQueryKeys.detail(data.id), {
          ...previousLead,
          ...data,
          updatedAt: new Date(),
        });
      }

      // Return a context object with the snapshotted value
      return { previousLead };
    },
    onError: (error, data, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLead) {
        queryClient.setQueryData(leadsQueryKeys.detail(data.id), context.previousLead);
      }
      toast.error(error.message || 'Failed to update lead');
    },
    onSettled: (data) => {
      // Always refetch after error or success
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(data.id) });
      }
    },
  });
}

// AWCRM Contacts Hook - Modern React Hook with TanStack Query
// Custom hook for contact management with caching, optimistic updates, and error handling

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Contact,
  CreateContactData,
  UpdateContactData,
  ContactListParams,
  ContactListResponse,
} from '../types/contact.types';

// API functions (these would call your actual API endpoints)
const contactsApi = {
  getContacts: async (params: ContactListParams, organizationId: string): Promise<ContactListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params.filters?.search) searchParams.set('search', params.filters.search);
    if (params.filters?.status) searchParams.set('status', params.filters.status);
    if (params.filters?.company) searchParams.set('company', params.filters.company);
    
    const response = await fetch(`/api/contacts?${searchParams.toString()}`, {
      headers: {
        'x-organization-id': organizationId,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }
    
    return response.json();
  },

  getContact: async (id: string, organizationId: string): Promise<Contact> => {
    const response = await fetch(`/api/contacts/${id}`, {
      headers: {
        'x-organization-id': organizationId,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch contact');
    }
    
    return response.json();
  },

  createContact: async (data: CreateContactData, organizationId: string): Promise<Contact> => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': organizationId,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create contact');
    }
    
    return response.json();
  },

  updateContact: async (data: UpdateContactData, organizationId: string): Promise<Contact> => {
    const response = await fetch(`/api/contacts/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': organizationId,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update contact');
    }
    
    return response.json();
  },

  deleteContact: async (id: string, organizationId: string): Promise<void> => {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'x-organization-id': organizationId,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete contact');
    }
  },
};

// Query keys for consistent caching
export const contactsQueryKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsQueryKeys.all, 'list'] as const,
  list: (params: ContactListParams) => [...contactsQueryKeys.lists(), params] as const,
  details: () => [...contactsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactsQueryKeys.details(), id] as const,
  stats: () => [...contactsQueryKeys.all, 'stats'] as const,
};

// Hook for fetching contacts list
export function useContacts(params: ContactListParams, organizationId: string) {
  return useQuery({
    queryKey: contactsQueryKeys.list(params),
    queryFn: () => contactsApi.getContacts(params, organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching single contact
export function useContact(id: string, organizationId: string) {
  return useQuery({
    queryKey: contactsQueryKeys.detail(id),
    queryFn: () => contactsApi.getContact(id, organizationId),
    enabled: !!id && !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating contact
export function useCreateContact(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactData) => contactsApi.createContact(data, organizationId),
    onSuccess: (newContact) => {
      // Invalidate and refetch contacts list
      queryClient.invalidateQueries({ queryKey: contactsQueryKeys.lists() });
      
      // Add the new contact to the cache
      queryClient.setQueryData(contactsQueryKeys.detail(newContact.id), newContact);
      
      toast.success('Contact created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create contact');
    },
  });
}

// Hook for updating contact
export function useUpdateContact(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContactData) => contactsApi.updateContact(data, organizationId),
    onSuccess: (updatedContact) => {
      // Update the contact in the cache
      queryClient.setQueryData(contactsQueryKeys.detail(updatedContact.id), updatedContact);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: contactsQueryKeys.lists() });
      
      toast.success('Contact updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contact');
    },
  });
}

// Hook for deleting contact
export function useDeleteContact(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactsApi.deleteContact(id, organizationId),
    onSuccess: (_, deletedId) => {
      // Remove the contact from cache
      queryClient.removeQueries({ queryKey: contactsQueryKeys.detail(deletedId) });
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: contactsQueryKeys.lists() });
      
      toast.success('Contact deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete contact');
    },
  });
}

// Hook for optimistic contact updates (for better UX)
export function useOptimisticUpdateContact(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContactData) => contactsApi.updateContact(data, organizationId),
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: contactsQueryKeys.detail(data.id) });

      // Snapshot the previous value
      const previousContact = queryClient.getQueryData(contactsQueryKeys.detail(data.id));

      // Optimistically update to the new value
      if (previousContact) {
        queryClient.setQueryData(contactsQueryKeys.detail(data.id), {
          ...previousContact,
          ...data,
          updatedAt: new Date(),
        });
      }

      // Return a context object with the snapshotted value
      return { previousContact };
    },
    onError: (error, data, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousContact) {
        queryClient.setQueryData(contactsQueryKeys.detail(data.id), context.previousContact);
      }
      toast.error(error.message || 'Failed to update contact');
    },
    onSettled: (data) => {
      // Always refetch after error or success
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: contactsQueryKeys.detail(data.id) });
      }
    },
  });
}

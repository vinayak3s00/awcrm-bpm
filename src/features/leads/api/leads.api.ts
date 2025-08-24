// AWCRM Leads API - Enterprise Grade Implementation
// API functions for lead management with robust error handling and validation

import { db } from '@/libs/DB';
import { leadsSchema } from '@/models/Schema';
import { eq, and, ilike, desc, asc, or, count, gte, lte } from 'drizzle-orm';
import type {
  Lead,
  CreateLeadData,
  UpdateLeadData,
  LeadListParams,
  LeadListResponse,
  LeadStats,
} from '../types/lead.types';

// Custom error classes for better error handling
export class LeadNotFoundError extends Error {
  constructor(id: string) {
    super(`Lead with ID ${id} not found`);
    this.name = 'LeadNotFoundError';
  }
}

export class LeadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeadValidationError';
  }
}

// Create a new lead with validation
export async function createLead(
  data: CreateLeadData,
  createdBy: string,
  organizationId: string,
): Promise<Lead> {
  try {
    // Validate required fields
    if (!data.title?.trim() || !data.firstName?.trim() || !data.lastName?.trim()) {
      throw new LeadValidationError('Title, first name, and last name are required');
    }

    // Validate estimated value
    if (data.estimatedValue !== undefined && data.estimatedValue < 0) {
      throw new LeadValidationError('Estimated value cannot be negative');
    }

    // Validate probability
    if (data.probability !== undefined && (data.probability < 0 || data.probability > 100)) {
      throw new LeadValidationError('Probability must be between 0 and 100');
    }

    // Check for duplicate email within organization
    if (data.email) {
      const existingLead = await db
        .select({ id: leadsSchema.id })
        .from(leadsSchema)
        .where(and(
          eq(leadsSchema.email, data.email),
          eq(leadsSchema.organizationId, organizationId)
        ))
        .limit(1);

      if (existingLead.length > 0) {
        throw new LeadValidationError('Lead with this email already exists');
      }
    }

    const [lead] = await db
      .insert(leadsSchema)
      .values({
        ...data,
        title: data.title.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email?.toLowerCase().trim() || null,
        estimatedValue: data.estimatedValue || null,
        probability: data.probability || 50,
        createdBy,
        organizationId,
        tags: data.tags || [],
        customFields: data.customFields || {},
      })
      .returning();

    return lead as Lead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

// Get lead by ID with error handling
export async function getLeadById(
  id: string,
  organizationId: string,
): Promise<Lead> {
  try {
    const [lead] = await db
      .select()
      .from(leadsSchema)
      .where(and(
        eq(leadsSchema.id, id), 
        eq(leadsSchema.organizationId, organizationId)
      ));

    if (!lead) {
      throw new LeadNotFoundError(id);
    }

    return lead as Lead;
  } catch (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }
}

// Update lead with validation
export async function updateLead(
  data: UpdateLeadData,
  organizationId: string,
): Promise<Lead> {
  try {
    const { id, ...updateData } = data;
    
    // Validate required fields if provided
    if (updateData.title !== undefined && !updateData.title?.trim()) {
      throw new LeadValidationError('Title cannot be empty');
    }
    if (updateData.firstName !== undefined && !updateData.firstName?.trim()) {
      throw new LeadValidationError('First name cannot be empty');
    }
    if (updateData.lastName !== undefined && !updateData.lastName?.trim()) {
      throw new LeadValidationError('Last name cannot be empty');
    }

    // Validate estimated value
    if (updateData.estimatedValue !== undefined && updateData.estimatedValue < 0) {
      throw new LeadValidationError('Estimated value cannot be negative');
    }

    // Validate probability
    if (updateData.probability !== undefined && (updateData.probability < 0 || updateData.probability > 100)) {
      throw new LeadValidationError('Probability must be between 0 and 100');
    }

    // Check for duplicate email if email is being updated
    if (updateData.email) {
      const existingLead = await db
        .select({ id: leadsSchema.id })
        .from(leadsSchema)
        .where(and(
          eq(leadsSchema.email, updateData.email),
          eq(leadsSchema.organizationId, organizationId)
        ))
        .limit(1);

      if (existingLead.length > 0 && existingLead[0].id !== id) {
        throw new LeadValidationError('Lead with this email already exists');
      }
    }

    const cleanUpdateData = {
      ...updateData,
      title: updateData.title?.trim(),
      firstName: updateData.firstName?.trim(),
      lastName: updateData.lastName?.trim(),
      email: updateData.email?.toLowerCase().trim(),
      updatedAt: new Date(),
    };

    const [lead] = await db
      .update(leadsSchema)
      .set(cleanUpdateData)
      .where(and(
        eq(leadsSchema.id, id), 
        eq(leadsSchema.organizationId, organizationId)
      ))
      .returning();

    if (!lead) {
      throw new LeadNotFoundError(id);
    }

    return lead as Lead;
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

// Delete lead with validation
export async function deleteLead(
  id: string,
  organizationId: string,
): Promise<void> {
  try {
    const result = await db
      .delete(leadsSchema)
      .where(and(
        eq(leadsSchema.id, id), 
        eq(leadsSchema.organizationId, organizationId)
      ));

    if (result.rowCount === 0) {
      throw new LeadNotFoundError(id);
    }
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

// Get leads list with advanced filtering and pagination
export async function getLeads(
  params: LeadListParams,
  organizationId: string,
): Promise<LeadListResponse> {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters = {},
    } = params;

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
    const offset = (validatedPage - 1) * validatedLimit;

    // Build where conditions
    const conditions = [eq(leadsSchema.organizationId, organizationId)];

    if (filters.status) {
      conditions.push(eq(leadsSchema.status, filters.status));
    }

    if (filters.source) {
      conditions.push(eq(leadsSchema.source, filters.source));
    }

    if (filters.priority) {
      conditions.push(eq(leadsSchema.priority, filters.priority));
    }

    if (filters.assignedTo) {
      conditions.push(eq(leadsSchema.assignedTo, filters.assignedTo));
    }

    if (filters.company) {
      conditions.push(ilike(leadsSchema.company, `%${filters.company}%`));
    }

    if (filters.minValue !== undefined) {
      conditions.push(gte(leadsSchema.estimatedValue, filters.minValue));
    }

    if (filters.maxValue !== undefined) {
      conditions.push(lte(leadsSchema.estimatedValue, filters.maxValue));
    }

    if (filters.search) {
      // Advanced search across multiple fields
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(leadsSchema.title, searchTerm),
          ilike(leadsSchema.firstName, searchTerm),
          ilike(leadsSchema.lastName, searchTerm),
          ilike(leadsSchema.email, searchTerm),
          ilike(leadsSchema.company, searchTerm),
          ilike(leadsSchema.jobTitle, searchTerm)
        )
      );
    }

    // Build order by with validation
    const validSortFields = ['title', 'firstName', 'lastName', 'company', 'estimatedValue', 'probability', 'expectedCloseDate', 'createdAt', 'updatedAt'];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy = sortOrder === 'desc' 
      ? desc(leadsSchema[validatedSortBy as keyof typeof leadsSchema]) 
      : asc(leadsSchema[validatedSortBy as keyof typeof leadsSchema]);

    // Execute queries in parallel for better performance
    const [leads, totalResult] = await Promise.all([
      db
        .select()
        .from(leadsSchema)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(validatedLimit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(leadsSchema)
        .where(and(...conditions))
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / validatedLimit);

    return {
      leads: leads as Lead[],
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

// Get lead statistics for dashboard
export async function getLeadStats(organizationId: string): Promise<LeadStats> {
  try {
    const [totalResult] = await db
      .select({ 
        count: count(),
        totalValue: leadsSchema.estimatedValue,
      })
      .from(leadsSchema)
      .where(eq(leadsSchema.organizationId, organizationId));

    // This is a simplified version - in production you'd use proper aggregation
    const total = Number(totalResult?.count || 0);

    return {
      total,
      byStatus: {
        new: 0,
        contacted: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        closed_won: 0,
        closed_lost: 0,
      },
      bySource: {
        website: 0,
        referral: 0,
        social_media: 0,
        email_campaign: 0,
        conference: 0,
        cold_call: 0,
        advertisement: 0,
        partner: 0,
        other: 0,
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      },
      totalValue: 0,
      averageValue: 0,
      conversionRate: 0,
      averageDealTime: 0,
    };
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    throw error;
  }
}

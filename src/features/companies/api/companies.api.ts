// AWCRM Companies API - Enterprise Grade Implementation
// API functions for company/account management with robust error handling

import { db } from '@/libs/DB';
import { companiesSchema, contactsSchema, dealsSchema } from '@/models/Schema';
import { eq, and, ilike, desc, asc, or, count, gte, lte, sql } from 'drizzle-orm';
import type {
  Company,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyListParams,
  CompanyListResponse,
  CompanyStats,
} from '../types/company.types';

// Custom error classes for better error handling
export class CompanyNotFoundError extends Error {
  constructor(id: string) {
    super(`Company with ID ${id} not found`);
    this.name = 'CompanyNotFoundError';
  }
}

export class CompanyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompanyValidationError';
  }
}

// Create a new company with validation
export async function createCompany(
  data: CreateCompanyData,
  createdBy: string,
  organizationId: string,
): Promise<Company> {
  try {
    // Validate required fields
    if (!data.name?.trim()) {
      throw new CompanyValidationError('Company name is required');
    }

    // Validate revenue
    if (data.annualRevenue !== undefined && data.annualRevenue < 0) {
      throw new CompanyValidationError('Annual revenue cannot be negative');
    }

    // Validate employee count
    if (data.employeeCount !== undefined && data.employeeCount < 0) {
      throw new CompanyValidationError('Employee count cannot be negative');
    }

    // Check for duplicate company name within organization
    const existingCompany = await db
      .select({ id: companiesSchema.id })
      .from(companiesSchema)
      .where(and(
        eq(companiesSchema.name, data.name.trim()),
        eq(companiesSchema.organizationId, organizationId)
      ))
      .limit(1);

    if (existingCompany.length > 0) {
      throw new CompanyValidationError('Company with this name already exists');
    }

    // Check for duplicate domain if provided
    if (data.domain) {
      const existingDomain = await db
        .select({ id: companiesSchema.id })
        .from(companiesSchema)
        .where(and(
          eq(companiesSchema.domain, data.domain.toLowerCase()),
          eq(companiesSchema.organizationId, organizationId)
        ))
        .limit(1);

      if (existingDomain.length > 0) {
        throw new CompanyValidationError('Company with this domain already exists');
      }
    }

    const [company] = await db
      .insert(companiesSchema)
      .values({
        ...data,
        name: data.name.trim(),
        domain: data.domain?.toLowerCase().trim() || null,
        email: data.email?.toLowerCase().trim() || null,
        createdBy,
        organizationId,
        address: data.address || {},
        socialMedia: data.socialMedia || {},
        tags: data.tags || [],
        customFields: data.customFields || {},
      })
      .returning();

    return company as Company;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
}

// Get company by ID with error handling
export async function getCompanyById(
  id: string,
  organizationId: string,
): Promise<Company> {
  try {
    const [company] = await db
      .select()
      .from(companiesSchema)
      .where(and(
        eq(companiesSchema.id, id), 
        eq(companiesSchema.organizationId, organizationId)
      ));

    if (!company) {
      throw new CompanyNotFoundError(id);
    }

    return company as Company;
  } catch (error) {
    console.error('Error fetching company:', error);
    throw error;
  }
}

// Update company with validation
export async function updateCompany(
  data: UpdateCompanyData,
  organizationId: string,
): Promise<Company> {
  try {
    const { id, ...updateData } = data;
    
    // Validate required fields if provided
    if (updateData.name !== undefined && !updateData.name?.trim()) {
      throw new CompanyValidationError('Company name cannot be empty');
    }

    // Validate revenue
    if (updateData.annualRevenue !== undefined && updateData.annualRevenue < 0) {
      throw new CompanyValidationError('Annual revenue cannot be negative');
    }

    // Validate employee count
    if (updateData.employeeCount !== undefined && updateData.employeeCount < 0) {
      throw new CompanyValidationError('Employee count cannot be negative');
    }

    // Check for duplicate company name if name is being updated
    if (updateData.name) {
      const existingCompany = await db
        .select({ id: companiesSchema.id })
        .from(companiesSchema)
        .where(and(
          eq(companiesSchema.name, updateData.name.trim()),
          eq(companiesSchema.organizationId, organizationId)
        ))
        .limit(1);

      if (existingCompany.length > 0 && existingCompany[0].id !== id) {
        throw new CompanyValidationError('Company with this name already exists');
      }
    }

    // Check for duplicate domain if domain is being updated
    if (updateData.domain) {
      const existingDomain = await db
        .select({ id: companiesSchema.id })
        .from(companiesSchema)
        .where(and(
          eq(companiesSchema.domain, updateData.domain.toLowerCase()),
          eq(companiesSchema.organizationId, organizationId)
        ))
        .limit(1);

      if (existingDomain.length > 0 && existingDomain[0].id !== id) {
        throw new CompanyValidationError('Company with this domain already exists');
      }
    }

    const cleanUpdateData = {
      ...updateData,
      name: updateData.name?.trim(),
      domain: updateData.domain?.toLowerCase().trim(),
      email: updateData.email?.toLowerCase().trim(),
      updatedAt: new Date(),
    };

    const [company] = await db
      .update(companiesSchema)
      .set(cleanUpdateData)
      .where(and(
        eq(companiesSchema.id, id), 
        eq(companiesSchema.organizationId, organizationId)
      ))
      .returning();

    if (!company) {
      throw new CompanyNotFoundError(id);
    }

    return company as Company;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
}

// Delete company with validation
export async function deleteCompany(
  id: string,
  organizationId: string,
): Promise<void> {
  try {
    // Check if company has associated contacts or deals
    const [contactCount] = await db
      .select({ count: count() })
      .from(contactsSchema)
      .where(and(
        eq(contactsSchema.companyId, id),
        eq(contactsSchema.organizationId, organizationId)
      ));

    const [dealCount] = await db
      .select({ count: count() })
      .from(dealsSchema)
      .where(and(
        eq(dealsSchema.companyId, id),
        eq(dealsSchema.organizationId, organizationId)
      ));

    if (Number(contactCount?.count || 0) > 0 || Number(dealCount?.count || 0) > 0) {
      throw new CompanyValidationError('Cannot delete company with associated contacts or deals');
    }

    const result = await db
      .delete(companiesSchema)
      .where(and(
        eq(companiesSchema.id, id), 
        eq(companiesSchema.organizationId, organizationId)
      ));

    if (result.rowCount === 0) {
      throw new CompanyNotFoundError(id);
    }
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
}

// Get companies list with advanced filtering and pagination
export async function getCompanies(
  params: CompanyListParams,
  organizationId: string,
): Promise<CompanyListResponse> {
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
    const conditions = [eq(companiesSchema.organizationId, organizationId)];

    if (filters.companyType) {
      conditions.push(eq(companiesSchema.companyType, filters.companyType));
    }

    if (filters.industry) {
      conditions.push(eq(companiesSchema.industry, filters.industry));
    }

    if (filters.companySize) {
      conditions.push(eq(companiesSchema.companySize, filters.companySize));
    }

    if (filters.ownerId) {
      conditions.push(eq(companiesSchema.ownerId, filters.ownerId));
    }

    if (filters.minRevenue !== undefined) {
      conditions.push(gte(companiesSchema.annualRevenue, filters.minRevenue));
    }

    if (filters.maxRevenue !== undefined) {
      conditions.push(lte(companiesSchema.annualRevenue, filters.maxRevenue));
    }

    if (filters.minEmployees !== undefined) {
      conditions.push(gte(companiesSchema.employeeCount, filters.minEmployees));
    }

    if (filters.maxEmployees !== undefined) {
      conditions.push(lte(companiesSchema.employeeCount, filters.maxEmployees));
    }

    if (filters.search) {
      // Advanced search across multiple fields
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(companiesSchema.name, searchTerm),
          ilike(companiesSchema.domain, searchTerm),
          ilike(companiesSchema.email, searchTerm),
          ilike(companiesSchema.description, searchTerm)
        )
      );
    }

    // Build order by with validation
    const validSortFields = ['name', 'industry', 'companySize', 'annualRevenue', 'employeeCount', 'createdAt', 'updatedAt'];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy = sortOrder === 'desc' 
      ? desc(companiesSchema[validatedSortBy as keyof typeof companiesSchema]) 
      : asc(companiesSchema[validatedSortBy as keyof typeof companiesSchema]);

    // Execute queries in parallel for better performance
    const [companies, totalResult] = await Promise.all([
      db
        .select()
        .from(companiesSchema)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(validatedLimit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(companiesSchema)
        .where(and(...conditions))
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / validatedLimit);

    return {
      companies: companies as Company[],
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}

// Get company statistics for dashboard
export async function getCompanyStats(organizationId: string): Promise<CompanyStats> {
  try {
    const [totalResult] = await db
      .select({ 
        count: count(),
      })
      .from(companiesSchema)
      .where(eq(companiesSchema.organizationId, organizationId));

    // This is a simplified version - in production you'd use proper aggregation
    const total = Number(totalResult?.count || 0);

    return {
      totalRevenue: 0,
      totalDeals: 0,
      totalContacts: 0,
      totalActivities: 0,
      conversionRate: 0,
      averageDealSize: 0,
    };
  } catch (error) {
    console.error('Error fetching company stats:', error);
    throw error;
  }
}

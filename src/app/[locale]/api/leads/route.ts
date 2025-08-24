// AWCRM Leads API Routes - Enterprise Grade Implementation
// RESTful API endpoints for lead management with validation and error handling

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createLead,
  getLeads,
  LeadValidationError,
} from '@/features/leads/api/leads.api';
import {
  withApiMiddleware,
  requireAuth,
  requireOrganization,
  validateRequest,
  createApiResponse,
  handleOptions,
} from '@/libs/ApiMiddleware';
import { contactCreateRateLimit } from '@/libs/RateLimit';
import type { LeadListParams } from '@/features/leads/types/lead.types';

// Validation schemas
const createLeadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  jobTitle: z.string().max(100).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('new'),
  source: z.enum(['website', 'referral', 'social_media', 'email_campaign', 'conference', 'cold_call', 'advertisement', 'partner', 'other']).default('other'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimatedValue: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).default(50),
  expectedCloseDate: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).default({}),
  notes: z.string().optional(),
  contactId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
});

const leadListParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['title', 'firstName', 'lastName', 'company', 'estimatedValue', 'probability', 'expectedCloseDate', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  source: z.enum(['website', 'referral', 'social_media', 'email_campaign', 'conference', 'cold_call', 'advertisement', 'partner', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  company: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  minValue: z.coerce.number().min(0).optional(),
  maxValue: z.coerce.number().min(0).optional(),
});

// GET /api/leads - Fetch leads list with filtering and pagination
export const GET = withApiMiddleware(async (request: NextRequest) => {
  // Authenticate user and get organization
  const { userId } = await requireAuth(request);
  const organizationId = requireOrganization(request.headers.get('x-organization-id') || undefined);

  // Parse and validate query parameters
  const { searchParams } = new URL(request.url);
  const params = validateRequest(leadListParamsSchema, {
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    sortBy: searchParams.get('sortBy'),
    sortOrder: searchParams.get('sortOrder'),
    search: searchParams.get('search'),
    status: searchParams.get('status'),
    source: searchParams.get('source'),
    priority: searchParams.get('priority'),
    company: searchParams.get('company'),
    assignedTo: searchParams.get('assignedTo'),
    minValue: searchParams.get('minValue'),
    maxValue: searchParams.get('maxValue'),
  });

  // Build filters object
  const filters: LeadListParams['filters'] = {};
  if (params.search) filters.search = params.search;
  if (params.status) filters.status = params.status;
  if (params.source) filters.source = params.source;
  if (params.priority) filters.priority = params.priority;
  if (params.company) filters.company = params.company;
  if (params.assignedTo) filters.assignedTo = params.assignedTo;
  if (params.minValue !== undefined) filters.minValue = params.minValue;
  if (params.maxValue !== undefined) filters.maxValue = params.maxValue;

  const leadListParams: LeadListParams = {
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    filters,
  };

  // Fetch leads
  const result = await getLeads(leadListParams, organizationId);

  return NextResponse.json(createApiResponse(result, 'Leads fetched successfully'));
});

// POST /api/leads - Create new lead
export const POST = withApiMiddleware(async (request: NextRequest) => {
  // Authenticate user and get organization
  const { userId } = await requireAuth(request);
  const organizationId = requireOrganization(request.headers.get('x-organization-id') || undefined);

  // Apply lead creation rate limiting
  const rateLimitResult = await contactCreateRateLimit.limit(`${userId}:${organizationId}`);
  if (!rateLimitResult.success) {
    throw new Error(`Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds`);
  }

  // Parse and validate request body
  const body = await request.json();
  const validatedData = validateRequest(createLeadSchema, body);

  // Clean up email field and convert date
  const leadData = {
    ...validatedData,
    email: validatedData.email || undefined,
    expectedCloseDate: validatedData.expectedCloseDate ? new Date(validatedData.expectedCloseDate) : undefined,
  };

  // Create lead
  const lead = await createLead(leadData, userId, organizationId);

  return NextResponse.json(
    createApiResponse(lead, 'Lead created successfully'),
    { status: 201 }
  );
});

// OPTIONS /api/leads - Handle CORS preflight
export const OPTIONS = handleOptions;

// AWCRM Contacts API Routes - Enterprise Grade Implementation
// RESTful API endpoints for contact management with validation and error handling

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createContact,
  getContacts,
  ContactValidationError,
} from '@/features/contacts/api/contacts.api';
import {
  withApiMiddleware,
  requireAuth,
  requireOrganization,
  validateRequest,
  createApiResponse,
  handleOptions,
} from '@/libs/ApiMiddleware';
import { contactCreateRateLimit } from '@/libs/RateLimit';
import type { ContactListParams } from '@/features/contacts/types/contact.types';

// Validation schemas
const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  jobTitle: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('prospect'),
  source: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).default({}),
  notes: z.string().optional(),
});

const contactListParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['firstName', 'lastName', 'company', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  company: z.string().optional(),
  source: z.string().optional(),
});

// OPTIONS /api/contacts - Handle CORS preflight
export const OPTIONS = handleOptions;

// GET /api/contacts - Fetch contacts list with filtering and pagination
export const GET = withApiMiddleware(async (request: NextRequest) => {
  // Authenticate user and get organization
  const { userId } = await requireAuth(request);
  const organizationId = requireOrganization(request.headers.get('x-organization-id') || undefined);

  // Parse and validate query parameters
  const { searchParams } = new URL(request.url);
  const params = validateRequest(contactListParamsSchema, {
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    sortBy: searchParams.get('sortBy'),
    sortOrder: searchParams.get('sortOrder'),
    search: searchParams.get('search'),
    status: searchParams.get('status'),
    company: searchParams.get('company'),
    source: searchParams.get('source'),
  });

  // Build filters object
  const filters: ContactListParams['filters'] = {};
  if (params.search) filters.search = params.search;
  if (params.status) filters.status = params.status;
  if (params.company) filters.company = params.company;
  if (params.source) filters.source = params.source;

  const contactListParams: ContactListParams = {
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    filters,
  };

  // Fetch contacts
  const result = await getContacts(contactListParams, organizationId);

  return NextResponse.json(createApiResponse(result, 'Contacts fetched successfully'));
});

// POST /api/contacts - Create new contact
export const POST = withApiMiddleware(async (request: NextRequest) => {
  // Authenticate user and get organization
  const { userId } = await requireAuth(request);
  const organizationId = requireOrganization(request.headers.get('x-organization-id') || undefined);

  // Apply contact creation rate limiting
  const rateLimitResult = await contactCreateRateLimit.limit(`${userId}:${organizationId}`);
  if (!rateLimitResult.success) {
    throw new Error(`Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds`);
  }

  // Parse and validate request body
  const body = await request.json();
  const validatedData = validateRequest(createContactSchema, body);

  // Clean up email field (convert empty string to undefined)
  const contactData = {
    ...validatedData,
    email: validatedData.email || undefined,
  };

  // Create contact
  const contact = await createContact(contactData, userId, organizationId);

  return NextResponse.json(
    createApiResponse(contact, 'Contact created successfully'),
    { status: 201 }
  );
});



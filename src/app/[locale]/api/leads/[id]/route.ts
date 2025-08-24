// AWCRM Individual Lead API Routes
// RESTful API endpoints for individual lead operations

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getLeadById,
  updateLead,
  deleteLead,
  LeadNotFoundError,
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

// Validation schemas
const updateLeadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).optional(),
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  jobTitle: z.string().max(100).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  source: z.enum(['website', 'referral', 'social_media', 'email_campaign', 'conference', 'cold_call', 'advertisement', 'partner', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  estimatedValue: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  notes: z.string().optional(),
  contactId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
});

const leadIdSchema = z.string().uuid('Invalid lead ID format');

// GET /api/leads/[id] - Fetch single lead
export const GET = withApiMiddleware(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Authenticate user and get organization
  const { userId } = await requireAuth(request);
  const organizationId = requireOrganization(request.headers.get('x-organization-id') || undefined);

  // Validate lead ID
  const leadId = validateRequest(leadIdSchema, params.id);

  // Fetch lead
  const lead = await getLeadById(leadId, organizationId);

  return NextResponse.json(createApiResponse(lead, 'Lead fetched successfully'));
});

// PUT /api/leads/[id] - Update lead
export const PUT = withApiMiddleware(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Authenticate user and get organization
  const { userId } = await requireAuth(request);
  const organizationId = requireOrganization(request.headers.get('x-organization-id') || undefined);

  // Validate lead ID
  const leadId = validateRequest(leadIdSchema, params.id);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = validateRequest(updateLeadSchema, body);

  // Clean up email field and convert date
  const updateData = {
    ...validatedData,
    email: validatedData.email || undefined,
    expectedCloseDate: validatedData.expectedCloseDate ? new Date(validatedData.expectedCloseDate) : undefined,
    id: leadId,
  };

  // Update lead
  const lead = await updateLead(updateData, organizationId);

  return NextResponse.json(createApiResponse(lead, 'Lead updated successfully'));
});

// DELETE /api/leads/[id] - Delete lead
export const DELETE = withApiMiddleware(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Authenticate user and get organization
  const { userId } = await requireAuth(request);
  const organizationId = requireOrganization(request.headers.get('x-organization-id') || undefined);

  // Validate lead ID
  const leadId = validateRequest(leadIdSchema, params.id);

  // Delete lead
  await deleteLead(leadId, organizationId);

  return NextResponse.json(
    createApiResponse(null, 'Lead deleted successfully'),
    { status: 200 }
  );
});

// OPTIONS /api/leads/[id] - Handle CORS preflight
export const OPTIONS = handleOptions;

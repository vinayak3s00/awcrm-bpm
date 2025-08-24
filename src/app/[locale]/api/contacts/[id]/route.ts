// AWCRM Individual Contact API Routes
// RESTful API endpoints for individual contact operations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import {
  getContactById,
  updateContact,
  deleteContact,
  ContactNotFoundError,
  ContactValidationError,
} from '@/features/contacts/api/contacts.api';

// Validation schemas
const updateContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  jobTitle: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  source: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

const contactIdSchema = z.string().uuid('Invalid contact ID format');

// Helper functions
function getOrganizationId(request: NextRequest): string {
  const orgId = request.headers.get('x-organization-id');
  if (!orgId) {
    throw new Error('Organization ID is required');
  }
  return orgId;
}

function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ContactNotFoundError) {
    return NextResponse.json(
      { error: error.message, type: 'not_found' },
      { status: 404 }
    );
  }

  if (error instanceof ContactValidationError) {
    return NextResponse.json(
      { error: error.message, type: 'validation' },
      { status: 400 }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        details: error.errors,
        type: 'validation'
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message, type: 'general' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error', type: 'general' },
    { status: 500 }
  );
}

// GET /api/contacts/[id] - Fetch single contact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate contact ID
    const contactId = contactIdSchema.parse(params.id);

    // Get organization ID
    const organizationId = getOrganizationId(request);

    // Fetch contact
    const contact = await getContactById(contactId, organizationId);

    return NextResponse.json(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/contacts/[id] - Update contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate contact ID
    const contactId = contactIdSchema.parse(params.id);

    // Get organization ID
    const organizationId = getOrganizationId(request);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateContactSchema.parse(body);

    // Clean up email field (convert empty string to undefined)
    const updateData = {
      ...validatedData,
      email: validatedData.email || undefined,
      id: contactId,
    };

    // Update contact
    const contact = await updateContact(updateData, organizationId);

    return NextResponse.json(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/contacts/[id] - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate contact ID
    const contactId = contactIdSchema.parse(params.id);

    // Get organization ID
    const organizationId = getOrganizationId(request);

    // Delete contact
    await deleteContact(contactId, organizationId);

    return NextResponse.json(
      { message: 'Contact deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// OPTIONS /api/contacts/[id] - Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-organization-id',
    },
  });
}

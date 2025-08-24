import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db';
import { dealsSchema, contactsSchema, companiesSchema, usersSchema } from '@/models/Schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for updates
const updateDealSchema = z.object({
  title: z.string().min(1).optional(),
  value: z.number().min(0).optional(),
  currency: z.string().optional(),
  stage: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  actualCloseDate: z.string().optional(),
  status: z.enum(['open', 'won', 'lost']).optional(),
  description: z.string().optional(),
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  customFields: z.record(z.any()).optional(),
});

// Helper function to get user's organization
async function getUserOrganization(clerkId: string) {
  const user = await db
    .select({
      id: usersSchema.id,
      organizationId: usersSchema.organizationId,
    })
    .from(usersSchema)
    .where(eq(usersSchema.clerkId, clerkId))
    .limit(1);

  if (!user.length) {
    throw new Error('User not found');
  }

  return user[0];
}

// GET /api/deals/[id] - Get single deal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = await getUserOrganization(userId);

    const deal = await db
      .select({
        id: dealsSchema.id,
        title: dealsSchema.title,
        value: dealsSchema.value,
        currency: dealsSchema.currency,
        stage: dealsSchema.stage,
        probability: dealsSchema.probability,
        expectedCloseDate: dealsSchema.expectedCloseDate,
        actualCloseDate: dealsSchema.actualCloseDate,
        status: dealsSchema.status,
        description: dealsSchema.description,
        customFields: dealsSchema.customFields,
        contactId: dealsSchema.contactId,
        companyId: dealsSchema.companyId,
        ownerId: dealsSchema.ownerId,
        createdAt: dealsSchema.createdAt,
        updatedAt: dealsSchema.updatedAt,
        // Contact info
        contactName: contactsSchema.firstName,
        contactLastName: contactsSchema.lastName,
        contactEmail: contactsSchema.email,
        // Company info
        companyName: companiesSchema.name,
        companyDomain: companiesSchema.domain,
      })
      .from(dealsSchema)
      .leftJoin(contactsSchema, eq(dealsSchema.contactId, contactsSchema.id))
      .leftJoin(companiesSchema, eq(dealsSchema.companyId, companiesSchema.id))
      .where(
        and(
          eq(dealsSchema.id, id),
          eq(dealsSchema.organizationId, user.organizationId)
        )
      )
      .limit(1);

    if (!deal.length) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Format deal with computed fields
    const formattedDeal = {
      ...deal[0],
      contactName: deal[0].contactName && deal[0].contactLastName 
        ? `${deal[0].contactName} ${deal[0].contactLastName}`
        : deal[0].contactName || null,
      weightedValue: deal[0].value ? (deal[0].value * deal[0].probability / 100) : 0,
    };

    return NextResponse.json(formattedDeal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/deals/[id] - Update deal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = await getUserOrganization(userId);
    const body = await request.json();

    // Validate input
    const validationResult = updateDealSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Check if deal exists and belongs to user's organization
    const existingDeal = await db
      .select()
      .from(dealsSchema)
      .where(
        and(
          eq(dealsSchema.id, id),
          eq(dealsSchema.organizationId, user.organizationId)
        )
      )
      .limit(1);

    if (!existingDeal.length) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify contact exists if provided
    if (updateData.contactId) {
      const contact = await db
        .select({ id: contactsSchema.id })
        .from(contactsSchema)
        .where(
          and(
            eq(contactsSchema.id, updateData.contactId),
            eq(contactsSchema.organizationId, user.organizationId)
          )
        )
        .limit(1);

      if (!contact.length) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 400 }
        );
      }
    }

    // Verify company exists if provided
    if (updateData.companyId) {
      const company = await db
        .select({ id: companiesSchema.id })
        .from(companiesSchema)
        .where(
          and(
            eq(companiesSchema.id, updateData.companyId),
            eq(companiesSchema.organizationId, user.organizationId)
          )
        )
        .limit(1);

      if (!company.length) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 400 }
        );
      }
    }

    // Auto-set actualCloseDate when status changes to won/lost
    if (updateData.status && ['won', 'lost'].includes(updateData.status)) {
      updateData.actualCloseDate = new Date().toISOString();
    }

    // Update deal
    const updatedDeal = await db
      .update(dealsSchema)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dealsSchema.id, id),
          eq(dealsSchema.organizationId, user.organizationId)
        )
      )
      .returning();

    if (!updatedDeal.length) {
      return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
    }

    return NextResponse.json(updatedDeal[0]);
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/deals/[id] - Delete deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = await getUserOrganization(userId);

    // Check if deal exists and belongs to user's organization
    const existingDeal = await db
      .select()
      .from(dealsSchema)
      .where(
        and(
          eq(dealsSchema.id, id),
          eq(dealsSchema.organizationId, user.organizationId)
        )
      )
      .limit(1);

    if (!existingDeal.length) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Delete deal
    await db
      .delete(dealsSchema)
      .where(
        and(
          eq(dealsSchema.id, id),
          eq(dealsSchema.organizationId, user.organizationId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

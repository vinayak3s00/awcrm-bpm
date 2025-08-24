import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db';
import { dealsSchema, contactsSchema, companiesSchema, usersSchema } from '@/models/Schema';
import { eq, and, ilike, or, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const createDealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0, 'Value must be positive').optional(),
  currency: z.string().default('USD'),
  stage: z.string().min(1, 'Stage is required'),
  probability: z.number().min(0).max(100).default(50),
  expectedCloseDate: z.string().optional(),
  description: z.string().optional(),
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  customFields: z.record(z.any()).default({}),
});

const updateDealSchema = createDealSchema.partial();

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

// GET /api/deals - List deals with search, filtering, and pagination
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserOrganization(userId);
    if (!user.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    let whereConditions = [eq(dealsSchema.organizationId, user.organizationId)];

    // Add search condition
    if (search) {
      whereConditions.push(
        or(
          ilike(dealsSchema.title, `%${search}%`),
          ilike(dealsSchema.description, `%${search}%`)
        )!
      );
    }

    // Add stage filter
    if (stage) {
      whereConditions.push(eq(dealsSchema.stage, stage));
    }

    // Add status filter
    if (status && ['open', 'won', 'lost'].includes(status)) {
      whereConditions.push(eq(dealsSchema.status, status as any));
    }

    // Build sort condition
    const sortColumn = dealsSchema[sortBy as keyof typeof dealsSchema] || dealsSchema.createdAt;
    const sortDirection = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Execute query with joins
    const deals = await db
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
      .where(and(...whereConditions))
      .orderBy(sortDirection)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(dealsSchema)
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Format deals with computed fields
    const formattedDeals = deals.map(deal => ({
      ...deal,
      contactName: deal.contactName && deal.contactLastName 
        ? `${deal.contactName} ${deal.contactLastName}`
        : deal.contactName || null,
      weightedValue: deal.value ? (deal.value * deal.probability / 100) : 0,
    }));

    return NextResponse.json({
      data: formattedDeals,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
      meta: {
        search,
        stage,
        status,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/deals - Create a new deal
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserOrganization(userId);
    if (!user.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = createDealSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const dealData = validationResult.data;

    // Verify contact exists if provided
    if (dealData.contactId) {
      const contact = await db
        .select({ id: contactsSchema.id })
        .from(contactsSchema)
        .where(
          and(
            eq(contactsSchema.id, dealData.contactId),
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
    if (dealData.companyId) {
      const company = await db
        .select({ id: companiesSchema.id })
        .from(companiesSchema)
        .where(
          and(
            eq(companiesSchema.id, dealData.companyId),
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

    // Create deal
    const newDeal = await db
      .insert(dealsSchema)
      .values({
        ...dealData,
        ownerId: user.id,
        organizationId: user.organizationId,
        status: 'open',
      })
      .returning();

    return NextResponse.json(newDeal[0], { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

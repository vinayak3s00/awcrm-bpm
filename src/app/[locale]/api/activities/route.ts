import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db';
import { activitiesSchema, contactsSchema, companiesSchema, dealsSchema, usersSchema } from '@/models/Schema';
import { eq, and, ilike, or, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const createActivitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'task', 'note', 'demo']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  scheduledAt: z.string().optional(),
  completedAt: z.string().optional(),
  duration: z.number().optional(), // in minutes
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  customFields: z.record(z.any()).default({}),
});

const updateActivitySchema = createActivitySchema.partial();

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

// GET /api/activities - List activities with search, filtering, and pagination
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const contactId = searchParams.get('contactId');
    const companyId = searchParams.get('companyId');
    const dealId = searchParams.get('dealId');
    const sortBy = searchParams.get('sortBy') || 'scheduledAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    let whereConditions = [eq(activitiesSchema.organizationId, user.organizationId)];

    // Add search condition
    if (search) {
      whereConditions.push(
        or(
          ilike(activitiesSchema.subject, `%${search}%`),
          ilike(activitiesSchema.description, `%${search}%`)
        )!
      );
    }

    // Add filters
    if (type) {
      whereConditions.push(eq(activitiesSchema.type, type as any));
    }

    if (status) {
      whereConditions.push(eq(activitiesSchema.status, status as any));
    }

    if (contactId) {
      whereConditions.push(eq(activitiesSchema.contactId, contactId));
    }

    if (companyId) {
      whereConditions.push(eq(activitiesSchema.companyId, companyId));
    }

    if (dealId) {
      whereConditions.push(eq(activitiesSchema.dealId, dealId));
    }

    // Build sort condition
    const sortColumn = activitiesSchema[sortBy as keyof typeof activitiesSchema] || activitiesSchema.scheduledAt;
    const sortDirection = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Execute query with joins
    const activities = await db
      .select({
        id: activitiesSchema.id,
        type: activitiesSchema.type,
        subject: activitiesSchema.subject,
        description: activitiesSchema.description,
        status: activitiesSchema.status,
        priority: activitiesSchema.priority,
        scheduledAt: activitiesSchema.scheduledAt,
        completedAt: activitiesSchema.completedAt,
        duration: activitiesSchema.duration,
        customFields: activitiesSchema.customFields,
        contactId: activitiesSchema.contactId,
        companyId: activitiesSchema.companyId,
        dealId: activitiesSchema.dealId,
        ownerId: activitiesSchema.ownerId,
        createdAt: activitiesSchema.createdAt,
        updatedAt: activitiesSchema.updatedAt,
        // Contact info
        contactName: contactsSchema.firstName,
        contactLastName: contactsSchema.lastName,
        contactEmail: contactsSchema.email,
        // Company info
        companyName: companiesSchema.name,
        // Deal info
        dealTitle: dealsSchema.title,
        dealValue: dealsSchema.value,
      })
      .from(activitiesSchema)
      .leftJoin(contactsSchema, eq(activitiesSchema.contactId, contactsSchema.id))
      .leftJoin(companiesSchema, eq(activitiesSchema.companyId, companiesSchema.id))
      .leftJoin(dealsSchema, eq(activitiesSchema.dealId, dealsSchema.id))
      .where(and(...whereConditions))
      .orderBy(sortDirection)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(activitiesSchema)
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Format activities with computed fields
    const formattedActivities = activities.map(activity => ({
      ...activity,
      contactName: activity.contactName && activity.contactLastName 
        ? `${activity.contactName} ${activity.contactLastName}`
        : activity.contactName || null,
    }));

    return NextResponse.json({
      data: formattedActivities,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
      meta: {
        search,
        type,
        status,
        contactId,
        companyId,
        dealId,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create a new activity
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
    const validationResult = createActivitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const activityData = validationResult.data;

    // Verify related entities exist if provided
    if (activityData.contactId) {
      const contact = await db
        .select({ id: contactsSchema.id })
        .from(contactsSchema)
        .where(
          and(
            eq(contactsSchema.id, activityData.contactId),
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

    if (activityData.companyId) {
      const company = await db
        .select({ id: companiesSchema.id })
        .from(companiesSchema)
        .where(
          and(
            eq(companiesSchema.id, activityData.companyId),
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

    if (activityData.dealId) {
      const deal = await db
        .select({ id: dealsSchema.id })
        .from(dealsSchema)
        .where(
          and(
            eq(dealsSchema.id, activityData.dealId),
            eq(dealsSchema.organizationId, user.organizationId)
          )
        )
        .limit(1);

      if (!deal.length) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 400 }
        );
      }
    }

    // Create activity
    const newActivity = await db
      .insert(activitiesSchema)
      .values({
        ...activityData,
        ownerId: user.id,
        organizationId: user.organizationId,
      })
      .returning();

    return NextResponse.json(newActivity[0], { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

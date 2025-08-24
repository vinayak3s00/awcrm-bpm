import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db';
import { 
  contactsSchema, 
  companiesSchema, 
  dealsSchema, 
  activitiesSchema,
  usersSchema 
} from '@/models/Schema';
import { eq, and, gte, lte, count, sum, avg, sql } from 'drizzle-orm';

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

// Helper function to get date range
function getDateRange(period: string) {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  return { startDate, endDate: now };
}

// GET /api/analytics/dashboard - Get dashboard analytics
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
    const period = searchParams.get('period') || '30d';
    const { startDate, endDate } = getDateRange(period);

    // Get overview metrics
    const [
      totalContacts,
      totalCompanies,
      totalDeals,
      totalActivities,
      activeContacts,
      openDeals,
      wonDeals,
      lostDeals,
      totalDealValue,
      wonDealValue,
    ] = await Promise.all([
      // Total contacts
      db
        .select({ count: count() })
        .from(contactsSchema)
        .where(eq(contactsSchema.organizationId, user.organizationId)),

      // Total companies
      db
        .select({ count: count() })
        .from(companiesSchema)
        .where(eq(companiesSchema.organizationId, user.organizationId)),

      // Total deals
      db
        .select({ count: count() })
        .from(dealsSchema)
        .where(eq(dealsSchema.organizationId, user.organizationId)),

      // Total activities
      db
        .select({ count: count() })
        .from(activitiesSchema)
        .where(eq(activitiesSchema.organizationId, user.organizationId)),

      // Active contacts
      db
        .select({ count: count() })
        .from(contactsSchema)
        .where(
          and(
            eq(contactsSchema.organizationId, user.organizationId),
            eq(contactsSchema.status, 'active')
          )
        ),

      // Open deals
      db
        .select({ count: count() })
        .from(dealsSchema)
        .where(
          and(
            eq(dealsSchema.organizationId, user.organizationId),
            eq(dealsSchema.status, 'open')
          )
        ),

      // Won deals
      db
        .select({ count: count() })
        .from(dealsSchema)
        .where(
          and(
            eq(dealsSchema.organizationId, user.organizationId),
            eq(dealsSchema.status, 'won')
          )
        ),

      // Lost deals
      db
        .select({ count: count() })
        .from(dealsSchema)
        .where(
          and(
            eq(dealsSchema.organizationId, user.organizationId),
            eq(dealsSchema.status, 'lost')
          )
        ),

      // Total deal value
      db
        .select({ total: sum(dealsSchema.value) })
        .from(dealsSchema)
        .where(eq(dealsSchema.organizationId, user.organizationId)),

      // Won deal value
      db
        .select({ total: sum(dealsSchema.value) })
        .from(dealsSchema)
        .where(
          and(
            eq(dealsSchema.organizationId, user.organizationId),
            eq(dealsSchema.status, 'won')
          )
        ),
    ]);

    // Get pipeline metrics by stage
    const pipelineMetrics = await db
      .select({
        stage: dealsSchema.stage,
        count: count(),
        totalValue: sum(dealsSchema.value),
        avgValue: avg(dealsSchema.value),
      })
      .from(dealsSchema)
      .where(
        and(
          eq(dealsSchema.organizationId, user.organizationId),
          eq(dealsSchema.status, 'open')
        )
      )
      .groupBy(dealsSchema.stage);

    // Get recent activity trends (last 30 days)
    const activityTrends = await db
      .select({
        date: sql<string>`DATE(${activitiesSchema.createdAt})`,
        count: count(),
      })
      .from(activitiesSchema)
      .where(
        and(
          eq(activitiesSchema.organizationId, user.organizationId),
          gte(activitiesSchema.createdAt, startDate),
          lte(activitiesSchema.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(${activitiesSchema.createdAt})`)
      .orderBy(sql`DATE(${activitiesSchema.createdAt})`);

    // Get deal trends (last 30 days)
    const dealTrends = await db
      .select({
        date: sql<string>`DATE(${dealsSchema.createdAt})`,
        count: count(),
        totalValue: sum(dealsSchema.value),
      })
      .from(dealsSchema)
      .where(
        and(
          eq(dealsSchema.organizationId, user.organizationId),
          gte(dealsSchema.createdAt, startDate),
          lte(dealsSchema.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(${dealsSchema.createdAt})`)
      .orderBy(sql`DATE(${dealsSchema.createdAt})`);

    // Get contact source breakdown
    const contactSources = await db
      .select({
        source: contactsSchema.source,
        count: count(),
      })
      .from(contactsSchema)
      .where(eq(contactsSchema.organizationId, user.organizationId))
      .groupBy(contactsSchema.source)
      .orderBy(count());

    // Get top performing deals
    const topDeals = await db
      .select({
        id: dealsSchema.id,
        title: dealsSchema.title,
        value: dealsSchema.value,
        stage: dealsSchema.stage,
        probability: dealsSchema.probability,
        contactName: contactsSchema.firstName,
        contactLastName: contactsSchema.lastName,
        companyName: companiesSchema.name,
      })
      .from(dealsSchema)
      .leftJoin(contactsSchema, eq(dealsSchema.contactId, contactsSchema.id))
      .leftJoin(companiesSchema, eq(dealsSchema.companyId, companiesSchema.id))
      .where(
        and(
          eq(dealsSchema.organizationId, user.organizationId),
          eq(dealsSchema.status, 'open')
        )
      )
      .orderBy(sql`${dealsSchema.value} * ${dealsSchema.probability} DESC`)
      .limit(10);

    // Calculate conversion rates
    const totalClosedDeals = (wonDeals[0]?.count || 0) + (lostDeals[0]?.count || 0);
    const winRate = totalClosedDeals > 0 ? ((wonDeals[0]?.count || 0) / totalClosedDeals) * 100 : 0;
    const conversionRate = (totalContacts[0]?.count || 0) > 0 
      ? ((totalDeals[0]?.count || 0) / (totalContacts[0]?.count || 0)) * 100 
      : 0;

    // Calculate average deal size
    const avgDealSize = (totalDeals[0]?.count || 0) > 0 
      ? (totalDealValue[0]?.total || 0) / (totalDeals[0]?.count || 0)
      : 0;

    // Format response
    const analytics = {
      overview: {
        totalContacts: totalContacts[0]?.count || 0,
        totalCompanies: totalCompanies[0]?.count || 0,
        totalDeals: totalDeals[0]?.count || 0,
        totalActivities: totalActivities[0]?.count || 0,
        activeContacts: activeContacts[0]?.count || 0,
        openDeals: openDeals[0]?.count || 0,
        wonDeals: wonDeals[0]?.count || 0,
        lostDeals: lostDeals[0]?.count || 0,
        totalDealValue: totalDealValue[0]?.total || 0,
        wonDealValue: wonDealValue[0]?.total || 0,
        winRate: Math.round(winRate * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgDealSize: Math.round(avgDealSize * 100) / 100,
      },
      pipeline: {
        stages: pipelineMetrics.map(stage => ({
          ...stage,
          totalValue: stage.totalValue || 0,
          avgValue: Math.round((stage.avgValue || 0) * 100) / 100,
        })),
      },
      trends: {
        activities: activityTrends,
        deals: dealTrends.map(trend => ({
          ...trend,
          totalValue: trend.totalValue || 0,
        })),
      },
      sources: contactSources.filter(source => source.source),
      topDeals: topDeals.map(deal => ({
        ...deal,
        contactName: deal.contactName && deal.contactLastName 
          ? `${deal.contactName} ${deal.contactLastName}`
          : deal.contactName || null,
        weightedValue: (deal.value || 0) * (deal.probability || 0) / 100,
      })),
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

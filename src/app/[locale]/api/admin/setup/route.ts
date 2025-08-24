import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db';
import { 
  usersSchema, 
  organizationsSchema, 
  contactsSchema, 
  companiesSchema, 
  dealsSchema,
  activitiesSchema 
} from '@/models/Schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for admin setup
const adminSetupSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  adminEmail: z.string().email('Invalid email address'),
  adminFirstName: z.string().min(1, 'First name is required'),
  adminLastName: z.string().min(1, 'Last name is required'),
  createSampleData: z.boolean().default(true),
});

// Sample data for demo
const sampleContacts = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    jobTitle: 'CEO',
    status: 'active' as const,
    source: 'Website',
    notes: 'Key decision maker for enterprise deals',
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@techstart.io',
    phone: '+1 (555) 987-6543',
    company: 'TechStart Inc',
    jobTitle: 'CTO',
    status: 'prospect' as const,
    source: 'LinkedIn',
    notes: 'Interested in our cloud solutions',
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'mbrown@enterprise.com',
    phone: '+1 (555) 456-7890',
    company: 'Enterprise Solutions',
    jobTitle: 'VP Sales',
    status: 'active' as const,
    source: 'Referral',
    notes: 'Long-term client, high value potential',
  },
];

const sampleCompanies = [
  {
    name: 'Acme Corporation',
    domain: 'acme.com',
    industry: 'Technology',
    size: '500-1000',
    revenue: '$50M-100M',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    website: 'https://acme.com',
    status: 'active' as const,
  },
  {
    name: 'TechStart Inc',
    domain: 'techstart.io',
    industry: 'Software',
    size: '50-100',
    revenue: '$10M-50M',
    location: 'Austin, TX',
    phone: '+1 (555) 987-6543',
    website: 'https://techstart.io',
    status: 'prospect' as const,
  },
  {
    name: 'Enterprise Solutions',
    domain: 'enterprise.com',
    industry: 'Consulting',
    size: '1000+',
    revenue: '$100M+',
    location: 'New York, NY',
    phone: '+1 (555) 456-7890',
    website: 'https://enterprise.com',
    status: 'active' as const,
  },
];

// POST /api/admin/setup - Setup admin account and organization
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = adminSetupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { organizationName, adminEmail, adminFirstName, adminLastName, createSampleData } = validationResult.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.clerkId, userId))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create organization
    const newOrganization = await db
      .insert(organizationsSchema)
      .values({
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
        },
      })
      .returning();

    const organization = newOrganization[0];

    // Create admin user
    const newUser = await db
      .insert(usersSchema)
      .values({
        clerkId: userId,
        email: adminEmail,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'admin',
        organizationId: organization.id,
        settings: {
          notifications: {
            email: true,
            push: true,
            desktop: true,
          },
          preferences: {
            theme: 'light',
            language: 'en',
          },
        },
      })
      .returning();

    const user = newUser[0];

    let sampleDataResult = null;

    // Create sample data if requested
    if (createSampleData) {
      try {
        // Create sample contacts
        const createdContacts = await db
          .insert(contactsSchema)
          .values(
            sampleContacts.map(contact => ({
              ...contact,
              organizationId: organization.id,
              createdBy: user.id,
              tags: [],
              customFields: {},
            }))
          )
          .returning();

        // Create sample companies
        const createdCompanies = await db
          .insert(companiesSchema)
          .values(
            sampleCompanies.map(company => ({
              ...company,
              organizationId: organization.id,
              createdBy: user.id,
              customFields: {},
            }))
          )
          .returning();

        // Create sample deals
        const sampleDeals = [
          {
            title: 'Enterprise Software License',
            value: 50000,
            currency: 'USD',
            stage: 'proposal',
            probability: 50,
            expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            status: 'open' as const,
            description: 'Annual enterprise software license for 500 users',
            contactId: createdContacts[0]?.id,
            companyId: createdCompanies[0]?.id,
          },
          {
            title: 'Consulting Services',
            value: 25000,
            currency: 'USD',
            stage: 'negotiation',
            probability: 75,
            expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
            status: 'open' as const,
            description: '6-month consulting engagement',
            contactId: createdContacts[1]?.id,
            companyId: createdCompanies[1]?.id,
          },
          {
            title: 'Cloud Migration Project',
            value: 75000,
            currency: 'USD',
            stage: 'qualification',
            probability: 25,
            expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
            status: 'open' as const,
            description: 'Complete cloud infrastructure migration',
            contactId: createdContacts[2]?.id,
            companyId: createdCompanies[2]?.id,
          },
        ];

        const createdDeals = await db
          .insert(dealsSchema)
          .values(
            sampleDeals.map(deal => ({
              ...deal,
              organizationId: organization.id,
              ownerId: user.id,
              customFields: {},
            }))
          )
          .returning();

        // Create sample activities
        const sampleActivities = [
          {
            type: 'call' as const,
            subject: 'Discovery call with John Smith',
            description: 'Discussed requirements for enterprise license',
            status: 'completed' as const,
            priority: 'high' as const,
            scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 45,
            contactId: createdContacts[0]?.id,
            dealId: createdDeals[0]?.id,
          },
          {
            type: 'meeting' as const,
            subject: 'Product demo for TechStart Inc',
            description: 'Scheduled product demonstration',
            status: 'scheduled' as const,
            priority: 'medium' as const,
            scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
            duration: 60,
            contactId: createdContacts[1]?.id,
            dealId: createdDeals[1]?.id,
          },
          {
            type: 'email' as const,
            subject: 'Follow-up on proposal',
            description: 'Sent proposal follow-up email',
            status: 'completed' as const,
            priority: 'medium' as const,
            scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            contactId: createdContacts[2]?.id,
            dealId: createdDeals[2]?.id,
          },
        ];

        await db
          .insert(activitiesSchema)
          .values(
            sampleActivities.map(activity => ({
              ...activity,
              organizationId: organization.id,
              ownerId: user.id,
              customFields: {},
            }))
          );

        sampleDataResult = {
          contacts: createdContacts.length,
          companies: createdCompanies.length,
          deals: createdDeals.length,
          activities: sampleActivities.length,
        };
      } catch (error) {
        console.error('Error creating sample data:', error);
        // Continue without sample data
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account and organization created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
        sampleData: sampleDataResult,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error setting up admin account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/setup - Check if setup is needed
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.clerkId, userId))
      .limit(1);

    return NextResponse.json({
      setupRequired: existingUser.length === 0,
      userExists: existingUser.length > 0,
    });

  } catch (error) {
    console.error('Error checking setup status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

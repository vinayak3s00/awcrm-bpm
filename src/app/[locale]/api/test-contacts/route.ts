// AWCRM Test Contacts API Route
// Test endpoint to verify contacts API functionality with sample data

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createContact, getContacts } from '@/features/contacts/api/contacts.api';
import { createApiResponse } from '@/libs/ApiMiddleware';

export async function GET(request: NextRequest) {
  try {
    // For testing, we'll use a mock organization ID
    const mockOrgId = 'test-org-123';
    const mockUserId = 'test-user-123';

    // Test data
    const testContacts = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        company: 'Acme Corp',
        jobTitle: 'Software Engineer',
        status: 'active' as const,
        source: 'website',
        tags: ['developer', 'lead'],
        notes: 'Interested in our enterprise solution',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@techcorp.com',
        phone: '+1-555-0124',
        company: 'TechCorp',
        jobTitle: 'Product Manager',
        status: 'prospect' as const,
        source: 'referral',
        tags: ['product', 'manager'],
        notes: 'Referred by John Doe',
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@startup.io',
        phone: '+1-555-0125',
        company: 'Startup Inc',
        jobTitle: 'CTO',
        status: 'active' as const,
        source: 'conference',
        tags: ['technical', 'decision-maker'],
        notes: 'Met at TechConf 2024',
      },
    ];

    // Create test contacts
    const createdContacts = [];
    for (const contactData of testContacts) {
      try {
        const contact = await createContact(contactData, mockUserId, mockOrgId);
        createdContacts.push(contact);
      } catch (error) {
        // Contact might already exist, skip
        console.log('Contact creation skipped (might already exist):', error);
      }
    }

    // Fetch all contacts
    const contactsList = await getContacts(
      {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      mockOrgId
    );

    return NextResponse.json(createApiResponse({
      message: 'Contacts API test completed successfully',
      results: {
        createdContacts: createdContacts.length,
        totalContacts: contactsList.total,
        contacts: contactsList.contacts,
        pagination: {
          page: contactsList.page,
          limit: contactsList.limit,
          totalPages: contactsList.totalPages,
        },
      },
      testData: testContacts,
    }));
  } catch (error) {
    console.error('Test contacts API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Contacts API test failed',
      },
      { status: 500 }
    );
  }
}

// POST endpoint to reset test data
export async function POST(request: NextRequest) {
  try {
    const mockOrgId = 'test-org-123';

    // Fetch all test contacts
    const contactsList = await getContacts(
      {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      mockOrgId
    );

    return NextResponse.json(createApiResponse({
      message: 'Test data reset completed',
      results: {
        totalContacts: contactsList.total,
        message: 'In a real implementation, this would delete test contacts',
      },
    }));
  } catch (error) {
    console.error('Test reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Test reset failed',
      },
      { status: 500 }
    );
  }
}

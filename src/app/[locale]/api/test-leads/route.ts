// AWCRM Test Leads API Route
// Test endpoint to verify leads API functionality with sample data

import { NextRequest, NextResponse } from 'next/server';
import { createLead, getLeads } from '@/features/leads/api/leads.api';
import { createApiResponse } from '@/libs/ApiMiddleware';

export async function GET(request: NextRequest) {
  try {
    // For testing, we'll use a mock organization ID
    const mockOrgId = 'test-org-123';
    const mockUserId = 'test-user-123';

    // Test data
    const testLeads = [
      {
        title: 'Enterprise Software Deal',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0201',
        company: 'TechCorp Solutions',
        jobTitle: 'CTO',
        status: 'qualified' as const,
        source: 'website' as const,
        priority: 'high' as const,
        estimatedValue: 50000, // $500.00
        probability: 75,
        expectedCloseDate: new Date('2024-12-15'),
        tags: ['enterprise', 'software', 'high-value'],
        notes: 'Very interested in our enterprise solution. Follow up next week.',
      },
      {
        title: 'Marketing Automation Lead',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@startup.io',
        phone: '+1-555-0202',
        company: 'Startup Innovations',
        jobTitle: 'Marketing Director',
        status: 'proposal' as const,
        source: 'referral' as const,
        priority: 'medium' as const,
        estimatedValue: 25000, // $250.00
        probability: 60,
        expectedCloseDate: new Date('2024-11-30'),
        tags: ['marketing', 'automation', 'startup'],
        notes: 'Proposal sent. Waiting for feedback from their team.',
      },
      {
        title: 'Consulting Services Opportunity',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@consulting.com',
        phone: '+1-555-0203',
        company: 'Rodriguez Consulting',
        jobTitle: 'Principal Consultant',
        status: 'new' as const,
        source: 'conference' as const,
        priority: 'low' as const,
        estimatedValue: 15000, // $150.00
        probability: 30,
        expectedCloseDate: new Date('2025-01-15'),
        tags: ['consulting', 'services'],
        notes: 'Met at TechConf 2024. Initial interest shown.',
      },
      {
        title: 'E-commerce Platform Integration',
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@ecommerce.com',
        phone: '+1-555-0204',
        company: 'E-commerce Plus',
        jobTitle: 'Technical Lead',
        status: 'negotiation' as const,
        source: 'social_media' as const,
        priority: 'urgent' as const,
        estimatedValue: 75000, // $750.00
        probability: 85,
        expectedCloseDate: new Date('2024-11-15'),
        tags: ['ecommerce', 'integration', 'urgent'],
        notes: 'In final negotiations. Very close to closing.',
      },
    ];

    // Create test leads
    const createdLeads = [];
    for (const leadData of testLeads) {
      try {
        const lead = await createLead(leadData, mockUserId, mockOrgId);
        createdLeads.push(lead);
      } catch (error) {
        // Lead might already exist, skip
        console.log('Lead creation skipped (might already exist):', error);
      }
    }

    // Fetch all leads
    const leadsList = await getLeads(
      {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      mockOrgId
    );

    return NextResponse.json(createApiResponse({
      message: 'Leads API test completed successfully',
      results: {
        createdLeads: createdLeads.length,
        totalLeads: leadsList.total,
        leads: leadsList.leads,
        pagination: {
          page: leadsList.page,
          limit: leadsList.limit,
          totalPages: leadsList.totalPages,
        },
      },
      testData: testLeads,
    }));
  } catch (error) {
    console.error('Test leads API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Leads API test failed',
      },
      { status: 500 }
    );
  }
}

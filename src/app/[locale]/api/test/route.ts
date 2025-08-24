// AWCRM Test API Route
// Simple test endpoint to verify API functionality

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/DB';
import { contactsSchema, organizationsSchema, usersSchema } from '@/models/Schema';
import { count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const [contactCount] = await db.select({ count: count() }).from(contactsSchema);
    const [orgCount] = await db.select({ count: count() }).from(organizationsSchema);
    const [userCount] = await db.select({ count: count() }).from(usersSchema);

    return NextResponse.json({
      status: 'success',
      message: 'AWCRM API is working!',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables: {
          contacts: Number(contactCount.count),
          organizations: Number(orgCount.count),
          users: Number(userCount.count),
        },
      },
      auth: {
        available: true,
      },
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'API test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

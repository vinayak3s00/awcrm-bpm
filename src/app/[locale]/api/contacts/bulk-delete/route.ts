import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db';
import { contactsSchema } from '@/models/Schema';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema
const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID is required'),
});

// Helper function to get user's organization
async function getUserOrganization(clerkId: string) {
  // This should match your existing user/organization logic
  return { id: clerkId, organizationId: clerkId };
}

// POST /api/contacts/bulk-delete - Delete multiple contacts
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserOrganization(userId);
    const body = await request.json();

    // Validate input
    const validationResult = bulkDeleteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { ids } = validationResult.data;

    // Check which contacts exist and belong to user's organization
    const existingContacts = await db
      .select({ id: contactsSchema.id })
      .from(contactsSchema)
      .where(
        and(
          inArray(contactsSchema.id, ids),
          eq(contactsSchema.organizationId, user.organizationId)
        )
      );

    const existingIds = existingContacts.map(contact => contact.id);
    const notFoundIds = ids.filter(id => !existingIds.includes(id));

    if (existingIds.length === 0) {
      return NextResponse.json(
        { error: 'No contacts found to delete' },
        { status: 404 }
      );
    }

    // Delete contacts
    const deletedContacts = await db
      .delete(contactsSchema)
      .where(
        and(
          inArray(contactsSchema.id, existingIds),
          eq(contactsSchema.organizationId, user.organizationId)
        )
      )
      .returning({ id: contactsSchema.id });

    return NextResponse.json({
      success: true,
      deleted: deletedContacts.length,
      deletedIds: deletedContacts.map(c => c.id),
      notFound: notFoundIds,
    });
  } catch (error) {
    console.error('Error bulk deleting contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

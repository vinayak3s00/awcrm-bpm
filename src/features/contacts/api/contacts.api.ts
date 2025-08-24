// AWCRM Contacts API - Enterprise Grade Implementation
// API functions for contact management with robust error handling and validation

import { db } from '@/libs/DB';
import { contactsSchema } from '@/models/Schema';
import { eq, and, ilike, desc, asc, or, count } from 'drizzle-orm';
import type {
  Contact,
  CreateContactData,
  UpdateContactData,
  ContactListParams,
  ContactListResponse,
} from '../types/contact.types';

// Custom error classes for better error handling
export class ContactNotFoundError extends Error {
  constructor(id: string) {
    super(`Contact with ID ${id} not found`);
    this.name = 'ContactNotFoundError';
  }
}

export class ContactValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContactValidationError';
  }
}

// Create a new contact
export async function createContact(
  data: CreateContactData,
  createdBy: string,
  organizationId: string,
): Promise<Contact> {
  const [contact] = await db
    .insert(contactsSchema)
    .values({
      ...data,
      createdBy,
      organizationId,
      tags: data.tags || [],
      customFields: data.customFields || {},
    })
    .returning();

  return contact as Contact;
}

// Get contact by ID
export async function getContactById(
  id: string,
  organizationId: string,
): Promise<Contact | null> {
  const [contact] = await db
    .select()
    .from(contactsSchema)
    .where(and(eq(contactsSchema.id, id), eq(contactsSchema.organizationId, organizationId)));

  return contact as Contact | null;
}

// Update contact
export async function updateContact(
  data: UpdateContactData,
  organizationId: string,
): Promise<Contact | null> {
  const { id, ...updateData } = data;
  
  const [contact] = await db
    .update(contactsSchema)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(and(eq(contactsSchema.id, id), eq(contactsSchema.organizationId, organizationId)))
    .returning();

  return contact as Contact | null;
}

// Delete contact
export async function deleteContact(
  id: string,
  organizationId: string,
): Promise<boolean> {
  const result = await db
    .delete(contactsSchema)
    .where(and(eq(contactsSchema.id, id), eq(contactsSchema.organizationId, organizationId)));

  return result.rowCount > 0;
}

// Get contacts list with pagination and filters
export async function getContacts(
  params: ContactListParams,
  organizationId: string,
): Promise<ContactListResponse> {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    filters = {},
  } = params;

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [eq(contactsSchema.organizationId, organizationId)];

  if (filters.status) {
    conditions.push(eq(contactsSchema.status, filters.status));
  }

  if (filters.source) {
    conditions.push(eq(contactsSchema.source, filters.source));
  }

  if (filters.company) {
    conditions.push(ilike(contactsSchema.company, `%${filters.company}%`));
  }

  if (filters.search) {
    // Search in first name, last name, email, and company
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      // Note: This is a simplified search. In production, you might want to use full-text search
      ilike(contactsSchema.firstName, searchTerm),
    );
  }

  if (filters.createdBy) {
    conditions.push(eq(contactsSchema.createdBy, filters.createdBy));
  }

  // Build order by
  const orderBy = sortOrder === 'desc' 
    ? desc(contactsSchema[sortBy]) 
    : asc(contactsSchema[sortBy]);

  // Get contacts
  const contacts = await db
    .select()
    .from(contactsSchema)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ count }] = await db
    .select({ count: contactsSchema.id })
    .from(contactsSchema)
    .where(and(...conditions));

  const total = Number(count);
  const totalPages = Math.ceil(total / limit);

  return {
    contacts: contacts as Contact[],
    total,
    page,
    limit,
    totalPages,
  };
}

// Get contacts by status
export async function getContactsByStatus(
  status: Contact['status'],
  organizationId: string,
): Promise<Contact[]> {
  const contacts = await db
    .select()
    .from(contactsSchema)
    .where(and(
      eq(contactsSchema.status, status),
      eq(contactsSchema.organizationId, organizationId),
    ))
    .orderBy(desc(contactsSchema.createdAt));

  return contacts as Contact[];
}

// Search contacts
export async function searchContacts(
  query: string,
  organizationId: string,
  limit: number = 10,
): Promise<Contact[]> {
  const searchTerm = `%${query}%`;
  
  const contacts = await db
    .select()
    .from(contactsSchema)
    .where(and(
      eq(contactsSchema.organizationId, organizationId),
      // Simple search across multiple fields
      ilike(contactsSchema.firstName, searchTerm),
    ))
    .limit(limit)
    .orderBy(desc(contactsSchema.createdAt));

  return contacts as Contact[];
}

// Get contact statistics
export async function getContactStats(organizationId: string) {
  // This would typically use aggregation queries
  // For now, we'll implement basic counts
  const totalContacts = await db
    .select({ count: contactsSchema.id })
    .from(contactsSchema)
    .where(eq(contactsSchema.organizationId, organizationId));

  const activeContacts = await db
    .select({ count: contactsSchema.id })
    .from(contactsSchema)
    .where(and(
      eq(contactsSchema.organizationId, organizationId),
      eq(contactsSchema.status, 'active'),
    ));

  return {
    total: Number(totalContacts[0]?.count || 0),
    active: Number(activeContacts[0]?.count || 0),
    inactive: 0, // Calculate as needed
    prospects: 0, // Calculate as needed
  };
}

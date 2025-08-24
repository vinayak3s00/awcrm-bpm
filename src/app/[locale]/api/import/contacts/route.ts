import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db';
import { contactsSchema, usersSchema } from '@/models/Schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import Papa from 'papaparse';

// Validation schema for contact import
const importContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('prospect'),
  source: z.string().optional(),
  notes: z.string().optional(),
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

// Helper function to normalize CSV headers
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
    .replace(/firstname/g, 'firstName')
    .replace(/lastname/g, 'lastName')
    .replace(/jobtitle/g, 'jobTitle');
}

// Helper function to map CSV row to contact data
function mapCsvRowToContact(row: any, headerMap: Record<string, string>): any {
  const contact: any = {};
  
  Object.keys(row).forEach(csvHeader => {
    const normalizedHeader = normalizeHeader(csvHeader);
    const mappedField = headerMap[normalizedHeader] || normalizedHeader;
    
    if (mappedField && row[csvHeader]) {
      contact[mappedField] = row[csvHeader].toString().trim();
    }
  });

  return contact;
}

// POST /api/import/contacts - Import contacts from CSV/Excel
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const skipDuplicates = formData.get('skipDuplicates') === 'true';
    const updateExisting = formData.get('updateExisting') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV or Excel file.' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Failed to parse CSV file',
          details: parseResult.errors.map(err => err.message)
        },
        { status: 400 }
      );
    }

    const csvData = parseResult.data as any[];

    if (csvData.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      );
    }

    // Header mapping for common variations
    const headerMap: Record<string, string> = {
      'firstname': 'firstName',
      'first_name': 'firstName',
      'fname': 'firstName',
      'lastname': 'lastName',
      'last_name': 'lastName',
      'lname': 'lastName',
      'emailaddress': 'email',
      'email_address': 'email',
      'phonenumber': 'phone',
      'phone_number': 'phone',
      'companyname': 'company',
      'company_name': 'company',
      'organization': 'company',
      'jobtitle': 'jobTitle',
      'job_title': 'jobTitle',
      'title': 'jobTitle',
      'position': 'jobTitle',
    };

    // Process and validate data
    const results = {
      total: csvData.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; error: string; data: any }>,
    };

    const validContacts: any[] = [];
    const existingEmails = new Set<string>();

    // Get existing contacts by email to check for duplicates
    if (skipDuplicates || updateExisting) {
      const emails = csvData
        .map(row => {
          const mapped = mapCsvRowToContact(row, headerMap);
          return mapped.email;
        })
        .filter(email => email && email.includes('@'));

      if (emails.length > 0) {
        const existing = await db
          .select({ email: contactsSchema.email })
          .from(contactsSchema)
          .where(
            and(
              eq(contactsSchema.organizationId, user.organizationId),
              // Use IN clause for emails
            )
          );

        existing.forEach(contact => {
          if (contact.email) {
            existingEmails.add(contact.email.toLowerCase());
          }
        });
      }
    }

    // Validate and process each row
    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        const mappedContact = mapCsvRowToContact(row, headerMap);

        // Validate the contact data
        const validationResult = importContactSchema.safeParse(mappedContact);
        
        if (!validationResult.success) {
          results.errors.push({
            row: i + 2, // +2 because CSV rows start at 1 and we have a header
            error: validationResult.error.errors.map(e => e.message).join(', '),
            data: mappedContact,
          });
          continue;
        }

        const contactData = validationResult.data;

        // Check for duplicates
        if (contactData.email && existingEmails.has(contactData.email.toLowerCase())) {
          if (skipDuplicates) {
            results.skipped++;
            continue;
          } else if (updateExisting) {
            // Update existing contact
            await db
              .update(contactsSchema)
              .set({
                ...contactData,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(contactsSchema.email, contactData.email),
                  eq(contactsSchema.organizationId, user.organizationId)
                )
              );
            results.updated++;
            continue;
          }
        }

        // Add to valid contacts for batch insert
        validContacts.push({
          ...contactData,
          organizationId: user.organizationId,
          createdBy: user.id,
          tags: [],
          customFields: {},
        });

      } catch (error) {
        results.errors.push({
          row: i + 2,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: csvData[i],
        });
      }
    }

    // Batch insert valid contacts
    if (validContacts.length > 0) {
      try {
        // Insert in batches of 100 to avoid database limits
        const batchSize = 100;
        for (let i = 0; i < validContacts.length; i += batchSize) {
          const batch = validContacts.slice(i, i + batchSize);
          await db.insert(contactsSchema).values(batch);
          results.imported += batch.length;
        }
      } catch (error) {
        console.error('Batch insert error:', error);
        return NextResponse.json(
          { error: 'Failed to import contacts to database' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Import completed. ${results.imported} contacts imported, ${results.updated} updated, ${results.skipped} skipped, ${results.errors.length} errors.`,
    });

  } catch (error) {
    console.error('Error importing contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/import/contacts/template - Download CSV template
export async function GET() {
  try {
    const template = `firstName,lastName,email,phone,company,jobTitle,status,source,notes
John,Doe,john.doe@example.com,+1-555-123-4567,Acme Corp,CEO,prospect,Website,Sample contact
Jane,Smith,jane.smith@example.com,+1-555-987-6543,TechStart Inc,CTO,active,LinkedIn,Another sample`;

    return new NextResponse(template, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="contacts_template.csv"',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}

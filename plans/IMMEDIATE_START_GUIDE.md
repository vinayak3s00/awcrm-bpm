# 🚀 **IMMEDIATE START GUIDE**
## **Ready to Build Enterprise CRM - Start Now!**

---

## 🎯 **WEEK 1: FOUNDATION ENHANCEMENT**

### **Day 1: Dependencies & Setup**
```bash
# Navigate to project
cd awcrm-bpm

# Install CRM-specific dependencies
npm install @apollo/client graphql zustand @tanstack/react-table @dnd-kit/core @dnd-kit/sortable recharts date-fns

# Install additional UI components
npm install @radix-ui/react-toast @radix-ui/react-popover @radix-ui/react-tabs

# Install testing enhancements
npm install @testing-library/jest-dom @testing-library/user-event

# Start development
npm run dev
```

### **Day 2: Database Schema Enhancement**
```typescript
// src/models/Schema.ts - ADD to existing schema
import { pgTable, text, timestamp, uuid, boolean, decimal, integer } from 'drizzle-orm/pg-core';

// CRM Core Entities
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  jobTitle: text('job_title'),
  avatar: text('avatar'),
  status: text('status').default('active'),
  source: text('source'),
  tags: text('tags').array(),
  customFields: text('custom_fields'), // JSON string
  workspaceId: uuid('workspace_id').notNull(),
  companyId: uuid('company_id').references(() => companies.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  domain: text('domain'),
  industry: text('industry'),
  size: text('size'),
  revenue: decimal('revenue'),
  address: text('address'),
  phone: text('phone'),
  website: text('website'),
  logo: text('logo'),
  customFields: text('custom_fields'),
  workspaceId: uuid('workspace_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const deals = pgTable('deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  value: decimal('value'),
  currency: text('currency').default('USD'),
  stage: text('stage').notNull(),
  probability: integer('probability').default(50),
  expectedCloseDate: timestamp('expected_close_date'),
  actualCloseDate: timestamp('actual_close_date'),
  status: text('status').default('open'),
  description: text('description'),
  customFields: text('custom_fields'),
  workspaceId: uuid('workspace_id').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id),
  companyId: uuid('company_id').references(() => companies.id),
  ownerId: text('owner_id').notNull(), // Clerk user ID
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(), // 'call', 'email', 'meeting', 'task', 'note'
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  status: text('status').default('pending'),
  metadata: text('metadata'), // JSON string for type-specific data
  workspaceId: uuid('workspace_id').notNull(),
  assigneeId: text('assignee_id').notNull(), // Clerk user ID
  contactId: uuid('contact_id').references(() => contacts.id),
  companyId: uuid('company_id').references(() => companies.id),
  dealId: uuid('deal_id').references(() => deals.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Generate and run migration
// npm run db:generate
// npm run db:migrate
```

### **Day 3: Component Library Foundation**
```typescript
// src/components/ui/Button/Button.tsx - Enhanced button system
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/libs/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4',
        lg: 'h-10 px-6',
        xl: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button, buttonVariants };
```

### **Day 4: API Layer Setup**
```typescript
// src/app/[locale]/api/contacts/route.ts - Contact API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db';
import { contacts } from '@/models/Schema';
import { eq, and, ilike, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get workspace ID (use org ID or user ID)
    const workspaceId = userId; // Simplified for now

    let query = db.select().from(contacts).where(eq(contacts.workspaceId, workspaceId));

    if (search) {
      query = query.where(
        or(
          ilike(contacts.firstName, `%${search}%`),
          ilike(contacts.lastName, `%${search}%`),
          ilike(contacts.email, `%${search}%`)
        )
      );
    }

    const contactList = await query.limit(limit).offset(offset);

    return NextResponse.json({
      data: contactList,
      pagination: {
        limit,
        offset,
        total: contactList.length
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const workspaceId = userId;

    const newContact = await db.insert(contacts).values({
      ...body,
      workspaceId,
    }).returning();

    return NextResponse.json(newContact[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### **Day 5: Testing Setup**
```typescript
// tests/integration/contacts.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { testDb } from '@/libs/test-db';
import { contacts } from '@/models/Schema';

describe('Contact API', () => {
  beforeEach(async () => {
    // Clean up test data
    await testDb.delete(contacts);
  });

  it('should create a contact', async () => {
    const contactData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      workspaceId: 'test-workspace'
    };

    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });

    expect(response.status).toBe(200);
    const contact = await response.json();
    expect(contact.firstName).toBe('John');
    expect(contact.email).toBe('john@example.com');
  });

  it('should fetch contacts with search', async () => {
    // Create test contacts
    await testDb.insert(contacts).values([
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com', workspaceId: 'test' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', workspaceId: 'test' }
    ]);

    const response = await fetch('/api/contacts?search=john');
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0].firstName).toBe('John');
  });
});

// Run tests: npm test
```

---

## 🎯 **WEEK 2: CONTACT MANAGEMENT UI**

### **Day 6-7: Contact List Component**
```typescript
// src/features/contacts/ContactList.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/input';
import { useContacts } from '@/hooks/useContacts';

export function ContactList() {
  const [search, setSearch] = useState('');
  const { contacts, loading, error, createContact, deleteContact } = useContacts(search);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Add Contact
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={() => handleEdit(contact)}
            onDelete={() => deleteContact(contact.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

### **Day 8-10: Complete Contact Management**
- Contact creation form
- Contact editing modal
- Contact detail view
- Bulk operations
- Import/export functionality

---

## 🚀 **READY TO START!**

**Your Next.js boilerplate is PERFECT for this CRM build. Start with Day 1 and build incrementally with continuous testing!**

**Remember: Build frontend + backend together, test everything, and copy the best patterns from top CRMs!** 🎯

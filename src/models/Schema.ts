import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the Next.js initialization process through `instrumentation.ts`.
// Simply restart your Next.js server to apply the database changes.
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://www.prisma.io/?via=nextjsboilerplate
// Tested and compatible with Next.js Boilerplate

// Legacy counter table (keep for compatibility)
export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// =============================================================================
// AWCRM DATABASE SCHEMA - PHASE 1: FOUNDATION
// =============================================================================

// Enums for type safety
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'user']);
export const contactStatusEnum = pgEnum('contact_status', ['active', 'inactive', 'prospect']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']);
export const leadSourceEnum = pgEnum('lead_source', ['website', 'referral', 'social_media', 'email_campaign', 'conference', 'cold_call', 'advertisement', 'partner', 'other']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'urgent']);
export const dealStageEnum = pgEnum('deal_stage', ['prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost']);
export const activityTypeEnum = pgEnum('activity_type', ['call', 'email', 'meeting', 'task', 'note', 'demo', 'proposal_sent', 'contract_sent']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const companyTypeEnum = pgEnum('company_type', ['prospect', 'customer', 'partner', 'vendor', 'competitor']);
export const companySizeEnum = pgEnum('company_size', ['startup', 'small', 'medium', 'large', 'enterprise']);
export const industryEnum = pgEnum('industry', ['technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'real_estate', 'consulting', 'other']);

// Organizations table (multi-tenancy support)
export const organizationsSchema = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  description: text('description'),
  logoUrl: varchar('logo_url', { length: 500 }),
  settings: jsonb('settings').default({}),
  subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('free'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Users table (extends Clerk user data)
export const usersSchema = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: userRoleEnum('role').default('user').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  organizationId: uuid('organization_id').references(() => organizationsSchema.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Contacts table (core CRM entity)
export const contactsSchema = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  jobTitle: varchar('job_title', { length: 100 }),
  status: contactStatusEnum('status').default('prospect').notNull(),
  source: varchar('source', { length: 100 }),
  tags: jsonb('tags').default([]),
  customFields: jsonb('custom_fields').default({}),
  notes: text('notes'),
  companyId: uuid('company_id').references(() => companiesSchema.id),
  createdBy: uuid('created_by').references(() => usersSchema.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizationsSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Leads table (sales pipeline management)
export const leadsSchema = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  jobTitle: varchar('job_title', { length: 100 }),
  status: leadStatusEnum('status').default('new').notNull(),
  source: leadSourceEnum('source').default('other').notNull(),
  priority: priorityEnum('priority').default('medium').notNull(),
  estimatedValue: integer('estimated_value'), // in cents
  probability: integer('probability').default(50), // percentage 0-100
  expectedCloseDate: timestamp('expected_close_date', { mode: 'date' }),
  tags: jsonb('tags').default([]),
  customFields: jsonb('custom_fields').default({}),
  notes: text('notes'),
  contactId: uuid('contact_id').references(() => contactsSchema.id),
  assignedTo: uuid('assigned_to').references(() => usersSchema.id),
  createdBy: uuid('created_by').references(() => usersSchema.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizationsSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Companies table (account management)
export const companiesSchema = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  website: varchar('website', { length: 500 }),
  industry: industryEnum('industry'),
  companySize: companySizeEnum('company_size'),
  companyType: companyTypeEnum('company_type').default('prospect').notNull(),
  annualRevenue: bigint('annual_revenue', { mode: 'number' }), // in cents
  employeeCount: integer('employee_count'),
  description: text('description'),
  address: jsonb('address').default({}), // {street, city, state, country, zipCode}
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  socialMedia: jsonb('social_media').default({}), // {linkedin, twitter, facebook}
  tags: jsonb('tags').default([]),
  customFields: jsonb('custom_fields').default({}),
  notes: text('notes'),
  parentCompanyId: uuid('parent_company_id').references(() => companiesSchema.id),
  ownerId: uuid('owner_id').references(() => usersSchema.id),
  createdBy: uuid('created_by').references(() => usersSchema.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizationsSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Deals table (sales opportunities)
export const dealsSchema = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  stage: dealStageEnum('stage').default('prospecting').notNull(),
  value: bigint('value', { mode: 'number' }).notNull(), // in cents
  probability: integer('probability').default(50), // percentage 0-100
  expectedCloseDate: timestamp('expected_close_date', { mode: 'date' }),
  actualCloseDate: timestamp('actual_close_date', { mode: 'date' }),
  priority: priorityEnum('priority').default('medium').notNull(),
  source: leadSourceEnum('source').default('other').notNull(),
  tags: jsonb('tags').default([]),
  customFields: jsonb('custom_fields').default({}),
  notes: text('notes'),
  companyId: uuid('company_id').references(() => companiesSchema.id),
  contactId: uuid('contact_id').references(() => contactsSchema.id),
  leadId: uuid('lead_id').references(() => leadsSchema.id),
  ownerId: uuid('owner_id').references(() => usersSchema.id),
  createdBy: uuid('created_by').references(() => usersSchema.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizationsSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Activities table (communication tracking)
export const activitiesSchema = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: activityTypeEnum('type').notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description'),
  duration: integer('duration'), // in minutes
  outcome: varchar('outcome', { length: 255 }),
  scheduledAt: timestamp('scheduled_at', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  location: varchar('location', { length: 255 }),
  attendees: jsonb('attendees').default([]), // array of contact/user IDs
  metadata: jsonb('metadata').default({}), // call recordings, email content, etc.
  companyId: uuid('company_id').references(() => companiesSchema.id),
  contactId: uuid('contact_id').references(() => contactsSchema.id),
  dealId: uuid('deal_id').references(() => dealsSchema.id),
  leadId: uuid('lead_id').references(() => leadsSchema.id),
  ownerId: uuid('owner_id').references(() => usersSchema.id),
  createdBy: uuid('created_by').references(() => usersSchema.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizationsSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Tasks table (todo management)
export const tasksSchema = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('pending').notNull(),
  priority: priorityEnum('priority').default('medium').notNull(),
  dueDate: timestamp('due_date', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  tags: jsonb('tags').default([]),
  companyId: uuid('company_id').references(() => companiesSchema.id),
  contactId: uuid('contact_id').references(() => contactsSchema.id),
  dealId: uuid('deal_id').references(() => dealsSchema.id),
  leadId: uuid('lead_id').references(() => leadsSchema.id),
  assignedTo: uuid('assigned_to').references(() => usersSchema.id),
  createdBy: uuid('created_by').references(() => usersSchema.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizationsSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

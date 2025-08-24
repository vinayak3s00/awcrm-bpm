# 👨‍💻 AWCRM Developer Guide

**Complete development guide for AWCRM contributors and maintainers**

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Code Standards](#code-standards)

## 🛠️ Development Setup

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Environment Setup

1. **Clone Repository**
```bash
git clone https://github.com/your-username/awcrm-bpm.git
cd awcrm-bpm
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/awcrm_dev"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. **Database Setup**
```bash
# Create database
createdb awcrm_dev

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

5. **Start Development Server**
```bash
npm run dev
```

### VS Code Setup

Install recommended extensions:
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Auto Rename Tag
- Bracket Pair Colorizer

## 🏗️ Project Structure

```
awcrm-bpm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalization
│   │   │   ├── (auth)/        # Authenticated routes
│   │   │   │   ├── dashboard/ # Main CRM interface
│   │   │   │   │   ├── page.tsx           # Dashboard
│   │   │   │   │   ├── contacts/          # Contact management
│   │   │   │   │   ├── companies/         # Company management
│   │   │   │   │   ├── deals/             # Sales pipeline
│   │   │   │   │   └── activities/        # Activity tracking
│   │   │   │   └── setup/     # Initial setup
│   │   │   └── api/           # API endpoints
│   │   │       ├── contacts/  # Contact APIs
│   │   │       ├── companies/ # Company APIs
│   │   │       ├── deals/     # Deal APIs
│   │   │       ├── activities/# Activity APIs
│   │   │       ├── search/    # Search API
│   │   │       ├── analytics/ # Analytics API
│   │   │       ├── import/    # Import API
│   │   │       └── admin/     # Admin API
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── forms/            # Form components
│   │   │   ├── ContactForm.tsx
│   │   │   ├── CompanyForm.tsx
│   │   │   └── DealForm.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── CRMLayout.tsx
│   │   │   ├── CRMSidebar.tsx
│   │   │   └── CRMHeader.tsx
│   │   ├── ui/               # UI components
│   │   │   ├── DataTable.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Button.tsx
│   │   ├── search/           # Search components
│   │   │   └── GlobalSearch.tsx
│   │   ├── notifications/    # Notification components
│   │   │   └── NotificationCenter.tsx
│   │   ├── import/           # Import components
│   │   │   └── ImportContacts.tsx
│   │   └── help/             # Help components
│   │       └── KnowledgeBase.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useContacts.ts
│   │   ├── useCompanies.ts
│   │   ├── useDeals.ts
│   │   └── useActivities.ts
│   ├── libs/                 # Utility libraries
│   │   ├── db.ts            # Database connection
│   │   ├── auth.ts          # Authentication utilities
│   │   └── utils.ts         # General utilities
│   ├── models/               # Database schemas
│   │   └── Schema.ts        # Drizzle schemas
│   └── styles/               # Styling files
│       └── crm-globals.css  # CRM-specific styles
├── docs/                     # Documentation
│   ├── USER_GUIDE.md
│   ├── API_REFERENCE.md
│   ├── DEVELOPER_GUIDE.md
│   └── KNOWLEDGE_BASE.md
├── public/                   # Static assets
├── migrations/               # Database migrations
├── tests/                    # Test files
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── next.config.js           # Next.js configuration
```

## 🏛️ Architecture Overview

### Frontend Architecture

#### Component Hierarchy
```
App
├── CRMLayout
│   ├── CRMSidebar
│   ├── CRMHeader
│   │   ├── GlobalSearch
│   │   ├── NotificationCenter
│   │   └── KnowledgeBase
│   └── Page Content
│       ├── DataTable
│       ├── Modal
│       └── Forms
```

#### State Management
- **React Hooks** - Local component state
- **Custom Hooks** - Shared business logic
- **Context API** - Global state (when needed)
- **Server State** - API data with SWR/React Query patterns

#### Styling Strategy
- **Tailwind CSS** - Utility-first styling
- **Custom CSS Classes** - CRM-specific styles with `crm-` prefix
- **Responsive Design** - Mobile-first approach
- **Design System** - Consistent spacing, colors, typography

### Backend Architecture

#### API Design
- **RESTful APIs** - Standard HTTP methods
- **Route Handlers** - Next.js API routes
- **Middleware** - Authentication, validation, error handling
- **Type Safety** - Full TypeScript coverage

#### Database Design
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe database operations
- **Multi-tenant** - Organization-based data isolation
- **Migrations** - Version-controlled schema changes

## 🗄️ Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  organization_id UUID REFERENCES organizations(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Organizations
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Contacts
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  job_title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'prospect',
  source VARCHAR(255),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  company_id UUID REFERENCES companies(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Companies
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  industry VARCHAR(255),
  size VARCHAR(100),
  revenue VARCHAR(100),
  location VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  status VARCHAR(50) DEFAULT 'prospect',
  custom_fields JSONB DEFAULT '{}',
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Deals
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  value DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',
  stage VARCHAR(100) NOT NULL,
  probability INTEGER DEFAULT 50,
  expected_close_date DATE,
  actual_close_date DATE,
  status VARCHAR(50) DEFAULT 'open',
  description TEXT,
  custom_fields JSONB DEFAULT '{}',
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Activities
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  priority VARCHAR(50) DEFAULT 'medium',
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration INTEGER,
  custom_fields JSONB DEFAULT '{}',
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  deal_id UUID REFERENCES deals(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_companies_organization_id ON companies(organization_id);
CREATE INDEX idx_deals_organization_id ON deals(organization_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_activities_organization_id ON activities(organization_id);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);

-- Search indexes
CREATE INDEX idx_contacts_search ON contacts USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, '') || ' ' || COALESCE(company, '')));
CREATE INDEX idx_companies_search ON companies USING gin(to_tsvector('english', name || ' ' || COALESCE(domain, '')));
```

## 🔌 API Development

### API Structure

#### Route Organization
```
/api/
├── contacts/
│   ├── route.ts              # GET, POST
│   ├── [id]/route.ts         # GET, PUT, DELETE
│   └── bulk-delete/route.ts  # POST
├── companies/
│   ├── route.ts
│   └── [id]/route.ts
├── deals/
│   ├── route.ts
│   └── [id]/route.ts
├── activities/
│   ├── route.ts
│   └── [id]/route.ts
├── search/route.ts
├── analytics/
│   └── dashboard/route.ts
├── import/
│   └── contacts/route.ts
└── admin/
    └── setup/route.ts
```

#### API Patterns

**Standard CRUD Operations**
```typescript
// GET /api/contacts
export async function GET(request: NextRequest) {
  // 1. Authentication check
  // 2. Parse query parameters
  // 3. Build database query
  // 4. Execute query with pagination
  // 5. Return formatted response
}

// POST /api/contacts
export async function POST(request: NextRequest) {
  // 1. Authentication check
  // 2. Parse and validate request body
  // 3. Check for duplicates
  // 4. Create record
  // 5. Return created record
}
```

**Error Handling**
```typescript
try {
  // API logic
} catch (error) {
  console.error('Error description:', error);
  return NextResponse.json(
    { error: 'User-friendly error message' },
    { status: 500 }
  );
}
```

**Validation with Zod**
```typescript
const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  // ... other fields
});

const validationResult = createContactSchema.safeParse(body);
if (!validationResult.success) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: validationResult.error.errors
    },
    { status: 400 }
  );
}
```

### Database Operations

#### Using Drizzle ORM
```typescript
// Select with joins
const contacts = await db
  .select({
    id: contactsSchema.id,
    firstName: contactsSchema.firstName,
    lastName: contactsSchema.lastName,
    companyName: companiesSchema.name,
  })
  .from(contactsSchema)
  .leftJoin(companiesSchema, eq(contactsSchema.companyId, companiesSchema.id))
  .where(eq(contactsSchema.organizationId, organizationId))
  .limit(50);

// Insert with returning
const newContact = await db
  .insert(contactsSchema)
  .values(contactData)
  .returning();

// Update with conditions
await db
  .update(contactsSchema)
  .set({ updatedAt: new Date() })
  .where(
    and(
      eq(contactsSchema.id, contactId),
      eq(contactsSchema.organizationId, organizationId)
    )
  );
```

## 🎨 Frontend Development

### Component Development

#### Component Structure
```typescript
interface ComponentProps {
  // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="crm-component">
      {/* Component JSX */}
    </div>
  );
}
```

#### Custom Hooks Pattern
```typescript
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    // Fetch logic
  }, []);

  const createContact = useCallback(async (data: Partial<Contact>) => {
    // Create logic
  }, []);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact,
  };
}
```

### Styling Guidelines

#### CSS Class Naming
- **CRM Prefix** - Use `crm-` prefix for CRM-specific styles
- **Utility Classes** - Prefer Tailwind utilities
- **Component Classes** - Use for complex components

```css
/* CRM-specific styles */
.crm-button {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.crm-button-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.crm-button-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}
```

#### Responsive Design
```tsx
<div className="
  crm-gap-4
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
"
>
  {/* Responsive grid */}
</div>;
```

## 🧪 Testing

### Testing Strategy

#### Unit Tests
```typescript
// components/__tests__/ContactForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactForm } from '../ContactForm';

describe('ContactForm', () => {
  it('renders form fields', () => {
    render(<ContactForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const onSubmit = jest.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
  });
});
```

#### API Tests
```typescript
import { NextRequest } from 'next/server';
// api/__tests__/contacts.test.ts
import { GET, POST } from '../contacts/route';

describe('/api/contacts', () => {
  it('returns contacts for authenticated user', async () => {
    const request = new NextRequest('http://localhost/api/contacts');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.data).toBeInstanceOf(Array);
  });
});
```

### Running Tests
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Environment Setup

#### Production Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/awcrm_prod"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# Security
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"
```

#### Build Process
```bash
# Install dependencies
npm ci

# Build application
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🤝 Contributing

### Development Workflow

1. **Fork Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make Changes**
4. **Run Tests**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```
5. **Commit Changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
6. **Push Branch**
   ```bash
   git push origin feature/new-feature
   ```
7. **Create Pull Request**

### Commit Convention
```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 📏 Code Standards

### TypeScript Guidelines
- **Strict Mode** - Enable strict TypeScript checking
- **Type Definitions** - Define interfaces for all data structures
- **No Any** - Avoid `any` type, use proper types
- **Null Safety** - Handle null/undefined cases

### Code Quality
- **ESLint** - Follow ESLint rules
- **Prettier** - Use Prettier for formatting
- **Imports** - Organize imports consistently
- **Comments** - Add JSDoc comments for complex functions

### Performance Guidelines
- **Code Splitting** - Use dynamic imports for large components
- **Memoization** - Use React.memo and useMemo appropriately
- **Database Queries** - Optimize database queries
- **Bundle Size** - Monitor and optimize bundle size

---

**Questions?** Check our [Knowledge Base](./KNOWLEDGE_BASE.md) or open an issue on GitHub.

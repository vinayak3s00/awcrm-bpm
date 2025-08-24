# 🔌 AWCRM API Reference

**Complete API documentation for AWCRM endpoints**

## 📋 Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Contacts API](#contacts-api)
- [Companies API](#companies-api)
- [Deals API](#deals-api)
- [Activities API](#activities-api)
- [Search API](#search-api)
- [Analytics API](#analytics-api)
- [Import API](#import-api)
- [Admin API](#admin-api)

## 🔐 Authentication

All API endpoints require authentication using Clerk JWT tokens.

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting a Token
```javascript
import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();
const token = await getToken();
```

## 🌐 Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## 📄 Response Format

### Success Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "hasMore": true
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [...],
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## ❌ Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

### Common Error Codes
- `VALIDATION_FAILED` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Resource already exists
- `RATE_LIMITED` - Too many requests

## 👥 Contacts API

### List Contacts
```http
GET /api/contacts
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 50, max: 100) |
| `search` | string | Search term |
| `status` | string | Filter by status (active, inactive, prospect) |
| `source` | string | Filter by source |
| `sortBy` | string | Sort field (default: createdAt) |
| `sortOrder` | string | Sort direction (asc, desc) |

#### Example Request
```bash
curl -X GET "https://api.example.com/contacts?page=1&limit=20&status=active" \
  -H "Authorization: Bearer <token>"
```

#### Example Response
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "company": "Acme Corp",
      "jobTitle": "CEO",
      "status": "active",
      "source": "Website",
      "tags": ["vip", "decision-maker"],
      "notes": "Key contact for enterprise deals",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

### Create Contact
```http
POST /api/contacts
```

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "company": "Acme Corp",
  "jobTitle": "CEO",
  "status": "prospect",
  "source": "Website",
  "notes": "Interested in enterprise solution"
}
```

#### Validation Rules
- `firstName` - Required, min 1 character
- `lastName` - Required, min 1 character
- `email` - Optional, valid email format
- `phone` - Optional, any format
- `status` - Optional, enum: active, inactive, prospect
- `source` - Optional, string

### Get Contact
```http
GET /api/contacts/{id}
```

### Update Contact
```http
PUT /api/contacts/{id}
```

### Delete Contact
```http
DELETE /api/contacts/{id}
```

### Bulk Delete Contacts
```http
POST /api/contacts/bulk-delete
```

#### Request Body
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

## 🏢 Companies API

### List Companies
```http
GET /api/companies
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `search` | string | Search term |
| `industry` | string | Filter by industry |
| `size` | string | Filter by company size |
| `status` | string | Filter by status |

### Create Company
```http
POST /api/companies
```

#### Request Body
```json
{
  "name": "Acme Corporation",
  "domain": "acme.com",
  "industry": "Technology",
  "size": "500-1000",
  "revenue": "$50M-100M",
  "location": "San Francisco, CA",
  "phone": "+1-555-123-4567",
  "website": "https://acme.com",
  "status": "active"
}
```

### Get Company
```http
GET /api/companies/{id}
```

### Update Company
```http
PUT /api/companies/{id}
```

### Delete Company
```http
DELETE /api/companies/{id}
```

## 💼 Deals API

### List Deals
```http
GET /api/deals
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `stage` | string | Filter by pipeline stage |
| `status` | string | Filter by status (open, won, lost) |
| `contactId` | string | Filter by contact |
| `companyId` | string | Filter by company |

### Create Deal
```http
POST /api/deals
```

#### Request Body
```json
{
  "title": "Enterprise Software License",
  "value": 50000,
  "currency": "USD",
  "stage": "proposal",
  "probability": 50,
  "expectedCloseDate": "2024-02-15",
  "description": "Annual license for 500 users",
  "contactId": "contact-uuid",
  "companyId": "company-uuid"
}
```

#### Pipeline Stages
- `prospecting` - Initial contact (10% probability)
- `qualification` - Qualified lead (25% probability)
- `proposal` - Proposal sent (50% probability)
- `negotiation` - In negotiation (75% probability)
- `closed-won` - Deal won (100% probability)
- `closed-lost` - Deal lost (0% probability)

### Get Deal
```http
GET /api/deals/{id}
```

### Update Deal
```http
PUT /api/deals/{id}
```

### Delete Deal
```http
DELETE /api/deals/{id}
```

## 📅 Activities API

### List Activities
```http
GET /api/activities
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by activity type |
| `status` | string | Filter by status |
| `contactId` | string | Filter by contact |
| `companyId` | string | Filter by company |
| `dealId` | string | Filter by deal |

### Create Activity
```http
POST /api/activities
```

#### Request Body
```json
{
  "type": "call",
  "subject": "Discovery call with John Smith",
  "description": "Discuss requirements for enterprise license",
  "status": "scheduled",
  "priority": "high",
  "scheduledAt": "2024-01-25T14:00:00Z",
  "duration": 45,
  "contactId": "contact-uuid",
  "dealId": "deal-uuid"
}
```

#### Activity Types
- `call` - Phone call
- `email` - Email communication
- `meeting` - In-person or virtual meeting
- `task` - Action item or to-do
- `note` - Information note
- `demo` - Product demonstration

#### Activity Status
- `scheduled` - Planned for future
- `completed` - Finished
- `cancelled` - Cancelled

#### Priority Levels
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority

### Get Activity
```http
GET /api/activities/{id}
```

### Update Activity
```http
PUT /api/activities/{id}
```

### Delete Activity
```http
DELETE /api/activities/{id}
```

## 🔍 Search API

### Global Search
```http
GET /api/search
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required) |
| `type` | string | Filter by entity type |
| `limit` | integer | Max results (default: 10) |

#### Example Request
```bash
curl -X GET "https://api.example.com/search?q=john&limit=5" \
  -H "Authorization: Bearer <token>"
```

#### Example Response
```json
{
  "results": [
    {
      "id": "uuid",
      "type": "contact",
      "title": "John Smith",
      "subtitle": "CEO at Acme Corporation",
      "description": "john.smith@acme.com",
      "url": "/dashboard/contacts/uuid"
    }
  ],
  "query": "john",
  "total": 1
}
```

## 📊 Analytics API

### Dashboard Analytics
```http
GET /api/analytics/dashboard
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | Time period (7d, 30d, 90d, 1y) |

#### Example Response
```json
{
  "overview": {
    "totalContacts": 150,
    "totalCompanies": 45,
    "totalDeals": 23,
    "totalDealValue": 1250000,
    "winRate": 65.5,
    "avgDealSize": 54347
  },
  "pipeline": {
    "stages": [
      {
        "stage": "prospecting",
        "count": 5,
        "totalValue": 125000,
        "avgValue": 25000
      }
    ]
  },
  "trends": {
    "activities": [...],
    "deals": [...]
  }
}
```

## 📥 Import API

### Import Contacts
```http
POST /api/import/contacts
```

#### Request Body (multipart/form-data)
- `file` - CSV or Excel file
- `skipDuplicates` - Boolean (optional)
- `updateExisting` - Boolean (optional)

#### Example Response
```json
{
  "success": true,
  "results": {
    "total": 100,
    "imported": 85,
    "updated": 10,
    "skipped": 3,
    "errors": [
      {
        "row": 15,
        "error": "Invalid email format",
        "data": {...}
      }
    ]
  }
}
```

### Download Template
```http
GET /api/import/contacts/template
```

Returns a CSV template file for contact import.

## 👨‍💼 Admin API

### Setup Organization
```http
POST /api/admin/setup
```

#### Request Body
```json
{
  "organizationName": "Acme Corporation",
  "adminEmail": "admin@acme.com",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "createSampleData": true
}
```

### Check Setup Status
```http
GET /api/admin/setup
```

#### Example Response
```json
{
  "setupRequired": false,
  "userExists": true
}
```

## 🔄 Rate Limiting

### Limits
- **Standard endpoints**: 100 requests per minute
- **Search endpoints**: 60 requests per minute
- **Import endpoints**: 10 requests per minute

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## 📝 Webhooks (Coming Soon)

### Supported Events
- `contact.created`
- `contact.updated`
- `contact.deleted`
- `deal.created`
- `deal.updated`
- `deal.stage_changed`
- `activity.completed`

### Webhook Payload
```json
{
  "event": "contact.created",
  "data": {...},
  "timestamp": "2024-01-20T10:30:00Z",
  "organizationId": "org-uuid"
}
```

## 🧪 Testing

### Test Environment
```
Base URL: https://api-test.example.com
```

### Test Data
- Use test API keys for development
- Test data is reset daily
- No rate limiting in test environment

---

**Need help?** Check our [Developer Guide](./DEVELOPER_GUIDE.md) or contact our API support team.

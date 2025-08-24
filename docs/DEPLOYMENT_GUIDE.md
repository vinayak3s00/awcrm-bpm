# 🚀 AWCRM Deployment Guide

**Complete guide for deploying AWCRM to production environments**

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [Security Configuration](#security-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## ✅ Prerequisites

### Required Services
- **Database**: PostgreSQL 14+ (Supabase, AWS RDS, or self-hosted)
- **Authentication**: Clerk account and configuration
- **Hosting**: Vercel, AWS, or Docker-compatible platform
- **Domain**: Custom domain (optional but recommended)

### Required Accounts
- [Clerk](https://clerk.dev) - Authentication service
- [Vercel](https://vercel.com) - Hosting platform (recommended)
- [Supabase](https://supabase.com) - Database service (recommended)

## 🔧 Environment Setup

### Production Environment Variables

Create a `.env.production` file with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/setup"

# Next.js Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# Application Settings
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Optional: Analytics and Monitoring
SENTRY_DSN="your-sentry-dsn"
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"

# Optional: Email Configuration (for future features)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Security Considerations

#### Environment Variables Security
- **Never commit** `.env` files to version control
- **Use strong secrets** - Generate random 32+ character strings
- **Rotate secrets** regularly in production
- **Use environment-specific** configurations

#### Database Security
- **Use SSL connections** for database
- **Restrict database access** to application servers only
- **Regular backups** with encryption
- **Monitor database access** logs

## 🗄️ Database Setup

### Supabase Setup (Recommended)

1. **Create Supabase Project**
   - Go to [Supabase](https://supabase.com)
   - Create new project
   - Note the database URL

2. **Configure Database**
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Enable full-text search
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

3. **Run Migrations**
   ```bash
   # Set database URL
   export DATABASE_URL="your-supabase-url"

   # Run migrations
   npm run db:migrate
   ```

### AWS RDS Setup

1. **Create RDS Instance**
   - Choose PostgreSQL 14+
   - Configure security groups
   - Enable automated backups

2. **Configure Connection**
   ```env
   DATABASE_URL="postgresql://username:password@rds-endpoint:5432/awcrm"
   ```

3. **Security Group Rules**
   ```
   Type: PostgreSQL
   Port: 5432
   Source: Your application servers
   ```

### Self-Hosted PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # CentOS/RHEL
   sudo yum install postgresql-server postgresql-contrib
   ```

2. **Configure PostgreSQL**
   ```bash
   # Create database
   sudo -u postgres createdb awcrm_production

   # Create user
   sudo -u postgres createuser --interactive awcrm_user
   ```

3. **Security Configuration**
   ```bash
   # Edit pg_hba.conf for SSL
   sudo nano /etc/postgresql/14/main/pg_hba.conf

   # Add SSL requirement
   hostssl all all 0.0.0.0/0 md5
   ```

## ▲ Vercel Deployment

### Quick Deployment

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Configure project settings

2. **Environment Variables**
   - Add all production environment variables
   - Ensure sensitive data is properly secured

3. **Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm ci"
   }
   ```

4. **Deploy**
   ```bash
   # Using Vercel CLI
   npm i -g vercel
   vercel --prod
   ```

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Configure DNS**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working

### Environment-Specific Deployments

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Specific environment
vercel --env production
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=awcrm
      - POSTGRES_USER=awcrm_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
```

### Build and Deploy

```bash
# Build image
docker build -t awcrm:latest .

# Run with docker-compose
docker-compose up -d

# Scale application
docker-compose up -d --scale app=3
```

## ☁️ AWS Deployment

### ECS Deployment

1. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name awcrm-cluster
   ```

2. **Task Definition**
   ```json
   {
     "family": "awcrm-task",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "awcrm",
         "image": "your-account.dkr.ecr.region.amazonaws.com/awcrm:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "DATABASE_URL",
             "value": "your-database-url"
           }
         ]
       }
     ]
   }
   ```

3. **Service Configuration**
   ```bash
   aws ecs create-service \
     --cluster awcrm-cluster \
     --service-name awcrm-service \
     --task-definition awcrm-task \
     --desired-count 2
   ```

### Lambda Deployment (Serverless)

1. **Install Serverless Framework**
   ```bash
   npm install -g serverless
   npm install serverless-nextjs-plugin
   ```

2. **Serverless Configuration**
   ```yaml
   # serverless.yml
   service: awcrm

   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1

   plugins:
     - serverless-nextjs-plugin

   custom:
     nextjs:
       memory: 512
       timeout: 30
   ```

3. **Deploy**
   ```bash
   serverless deploy
   ```

## 🔒 Security Configuration

### SSL/TLS Setup

#### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## 📊 Monitoring & Logging

### Application Monitoring

#### Sentry Setup
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### Health Check Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await db.select().from(usersSchema).limit(1);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}
```

### Database Monitoring

```sql
-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Monitor slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor database size
SELECT pg_size_pretty(pg_database_size('awcrm'));
```

## 💾 Backup & Recovery

### Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="awcrm"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/awcrm_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/awcrm_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/awcrm_$DATE.sql.gz s3://your-backup-bucket/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "awcrm_*.sql.gz" -mtime +30 -delete
```

#### Cron Job Setup
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

### Application Backup

```bash
# Backup uploaded files
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /app/uploads

# Backup configuration
cp .env.production config_backup_$(date +%Y%m%d).env
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check connection limits
SELECT count(*) FROM pg_stat_activity;
```

#### Memory Issues
```bash
# Monitor memory usage
free -h

# Check Node.js memory
node --max-old-space-size=4096 server.js
```

#### SSL Certificate Issues
```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/domain/cert.pem -text -noout

# Renew certificate
certbot renew --dry-run
```

### Performance Optimization

#### Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM contacts WHERE organization_id = 'uuid';

-- Update statistics
ANALYZE;

-- Reindex if needed
REINDEX DATABASE awcrm;
```

#### Application Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
};
```

### Logs and Debugging

#### Application Logs
```bash
# View application logs
docker logs awcrm-app

# Follow logs
docker logs -f awcrm-app

# Filter logs
docker logs awcrm-app 2>&1 | grep ERROR
```

#### Database Logs
```bash
# PostgreSQL logs location
tail -f /var/log/postgresql/postgresql-14-main.log

# Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

---

**Need help with deployment?** Check our [Developer Guide](./DEVELOPER_GUIDE.md) or contact support.

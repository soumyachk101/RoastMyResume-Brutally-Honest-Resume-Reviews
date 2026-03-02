# 🚀 RoastMyResume.com — Deployment & DevOps Guide

## 1. Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                  │
│                                                            │
│  ┌────────────────────┐     ┌─────────────────────────┐   │
│  │   GitHub (Source)   │────>│   GitHub Actions (CI)   │   │
│  │   main branch       │     │   - Lint, Test, Build    │   │
│  └────────────────────┘     └───────────┬─────────────┘   │
│                                          │                  │
│                                  ┌───────▼───────┐         │
│                                  │    Vercel      │         │
│                                  │  (Auto-deploy) │         │
│                                  └───────┬───────┘         │
│                                          │                  │
│         ┌──────────────────┬─────────────┼──────────┐      │
│         │                  │             │          │      │
│         ▼                  ▼             ▼          ▼      │
│  ┌──────────────┐  ┌────────────┐ ┌──────────┐ ┌───────┐ │
│  │  Supabase    │  │  Upstash   │ │Cloudflare│ │Stripe │ │
│  │  PostgreSQL  │  │  Redis     │ │   R2     │ │  API  │ │
│  │  (Database)  │  │  (Cache)   │ │(Storage) │ │(Pay)  │ │
│  └──────────────┘  └────────────┘ └──────────┘ └───────┘ │
│                                                            │
│  Monitoring: Sentry (Errors) + PostHog (Analytics)        │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Environment Strategy

| Environment | Branch | URL | Purpose |
|------------|--------|-----|---------|
| **Development** | `develop` | `localhost:3000` | Local development |
| **Preview** | PR branches | `pr-{n}.vercel.app` | PR review & testing |
| **Staging** | `staging` | `staging.roastmyresume.com` | Pre-production testing |
| **Production** | `main` | `roastmyresume.com` | Live application |

---

## 3. Deployment Pipeline

```
┌─────────┐    ┌───────────┐    ┌──────────┐    ┌────────────┐
│  Code   │───>│   Pull    │───>│  GitHub  │───>│  Vercel    │
│  Push   │    │  Request  │    │ Actions  │    │  Deploy    │
└─────────┘    └───────────┘    └──────────┘    └────────────┘
                     │                │                │
               ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
               │  Preview   │   │  Lint     │   │ Preview   │
               │  Deploy    │   │  Test     │   │  URL      │
               │  (Auto)    │   │  Build    │   │  Ready    │
               └───────────┘   │  E2E      │   └───────────┘
                               └───────────┘
                                     │
                               ┌─────┴─────┐
                               │  Merge    │
                               │  to main  │
                               └─────┬─────┘
                                     │
                               ┌─────┴─────┐
                               │Production │
                               │  Deploy   │
                               │  (Auto)   │
                               └───────────┘
```

---

## 4. Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm turbo build --filter=web",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "lhr1"],
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 */6 * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" }
      ]
    }
  ]
}
```

---

## 5. Docker Configuration (Local Development)

```yaml
# docker/docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: roast
      POSTGRES_PASSWORD: roastpass
      POSTGRES_DB: roastmyresume
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U roast']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 6. Database Migration Strategy

```bash
# Migration commands (via Prisma)

# Create a new migration
pnpm db:migrate:create --name add_user_table

# Run migrations (development)
pnpm db:migrate:dev

# Run migrations (production — safe, no data loss)
pnpm db:migrate:deploy

# Reset database (development only!)
pnpm db:reset

# Seed database
pnpm db:seed

# Generate Prisma client
pnpm db:generate
```

### Migration Safety Rules
1. **NEVER** delete columns in production — mark as deprecated first
2. **ALWAYS** add new columns as nullable or with defaults
3. **ALWAYS** test migrations on staging before production
4. **ALWAYS** have a rollback plan (reverse migration script)
5. **NEVER** run `db:reset` in production
6. Use `prisma migrate deploy` in production (not `dev`)

---

## 7. Monitoring & Alerting Setup

### Sentry Configuration
```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  profilesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Scrub PII from events
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
    }
    return event;
  },
  ignoreErrors: [
    'QuotaExceededError', // Expected business logic
    'RateLimitError',     // Expected rate limiting
  ],
});
```

### Alert Configuration

| Alert | Condition | Channel | Severity |
|-------|-----------|---------|----------|
| Error Spike | Error rate > 5% for 5 min | PagerDuty | Critical |
| AI Latency | P95 > 15s for 10 min | Slack #alerts | Warning |
| Queue Backlog | Depth > 100 for 5 min | Slack #alerts | Warning |
| Payment Failures | > 3 failures in 10 min | PagerDuty | Critical |
| Database CPU | > 80% for 15 min | Slack #infra | Warning |
| Disk Usage | > 80% | Email | Warning |
| Uptime | Any downtime | PagerDuty | Critical |
| SSL Expiry | < 30 days | Email | Info |

---

## 8. Backup & Recovery

| What | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| PostgreSQL (Full) | Daily | 30 days | Supabase auto-backup |
| PostgreSQL (Point-in-time) | Continuous | 7 days | Supabase WAL |
| Redis | Hourly | 24 hours | Upstash snapshots |
| File Storage (R2) | N/A | 24h (auto-delete) | Not backed up (ephemeral) |
| Environment Secrets | On change | Versioned | Vercel encrypted env vars |
| Code | Every commit | Forever | GitHub |

### Recovery Procedures

```markdown
## Database Recovery (RTO: 30 min, RPO: 24 hours)
1. Go to Supabase Dashboard → Backups
2. Select the backup point
3. Click "Restore"
4. Update DATABASE_URL if endpoint changes
5. Verify application connectivity

## Redis Recovery (RTO: 5 min, RPO: 1 hour)
1. Redis data is ephemeral/cacheable
2. Application auto-recovers by re-querying database
3. Rate limit counters reset (acceptable)

## Full Application Recovery (RTO: 15 min)
1. Vercel auto-deploys from GitHub main branch
2. If Vercel is down: deploy to backup (Cloudflare Pages)
3. DNS failover: Cloudflare → backup provider
```

---

## 9. Development Workflow

```bash
# 1. Clone and setup
git clone https://github.com/your-org/roast-my-resume.git
cd roast-my-resume
pnpm install

# 2. Setup environment
cp .env.example .env.local
# Fill in your local environment variables

# 3. Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# 4. Setup database
pnpm db:migrate:dev
pnpm db:seed

# 5. Start development
pnpm dev

# 6. Run tests
pnpm test          # Unit tests
pnpm test:int      # Integration tests
pnpm test:e2e      # E2E tests (requires running app)

# 7. Create a feature
git checkout -b feature/my-feature
# ... make changes ...
pnpm lint
pnpm type-check
pnpm test
git commit -m "feat: add my feature"
git push origin feature/my-feature
# Create PR → CI runs → Review → Merge
```
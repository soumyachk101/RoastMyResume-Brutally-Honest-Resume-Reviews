# 🧵 Stitch & Master Deployment Guide
## RoastMyResume.com — How Everything Connects

---

## 1. The "Stitch" — How All Pieces Connect

```
┌─────────────────────────────────────────────────────────────┐
│                    THE COMPLETE PICTURE                       │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  01-PRD   │───▶│  02-TRD  │───▶│ 05-SOR   │              │
│  │  (What)   │    │  (How)   │    │(Contract)│              │
│  └──────────┘    └────┬─────┘    └──────────┘              │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │03-AI Inst│───▶│04-SysDes │───▶│06-CodeStr│              │
│  │(AI Brain)│    │(Architect)│   │(Blueprint)│              │
│  └──────────┘    └──────────┘    └────┬─────┘              │
│                                       │                      │
│                       ┌───────────────┤                      │
│                       ▼               ▼                      │
│                  ┌──────────┐    ┌──────────┐              │
│                  │07-Backend│───▶│08-Testing│              │
│                  │(Server)  │    │(Quality) │              │
│                  └──────────┘    └──────────┘              │
│                                       │                      │
│                                       ▼                      │
│                              ┌──────────────┐               │
│                              │  09-Stitch   │               │
│                              │  (This Doc)  │               │
│                              │  DEPLOYMENT  │               │
│                              └──────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Project Setup — Step by Step

### Step 1: Initialize Project

```bash
# Create Next.js project with TypeScript
npx create-next-app@latest roast-my-resume \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

cd roast-my-resume
```

### Step 2: Install Dependencies

```bash
# Core
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next
pnpm add @tanstack/react-query
pnpm add next-auth@beta @auth/prisma-adapter
pnpm add prisma @prisma/client
pnpm add zod
pnpm add zustand

# AI
pnpm add openai
pnpm add ai  # Vercel AI SDK for streaming

# UI
pnpm add framer-motion
pnpm add recharts
pnpm add react-dropzone
pnpm add react-hook-form @hookform/resolvers
pnpm add lucide-react
pnpm add class-variance-authority clsx tailwind-merge

# File parsing
pnpm add pdf-parse
pnpm add mammoth  # DOCX parsing

# Payments
pnpm add stripe @stripe/stripe-js

# Storage & Cache
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm add @upstash/redis @upstash/ratelimit

# Email
pnpm add resend

# Monitoring
pnpm add @sentry/nextjs
pnpm add posthog-js

# Dev dependencies
pnpm add -D vitest @vitejs/plugin-react
pnpm add -D @testing-library/react @testing-library/jest-dom
pnpm add -D @playwright/test
pnpm add -D msw
pnpm add -D @faker-js/faker
pnpm add -D prettier eslint-config-prettier
pnpm add -D husky lint-staged
pnpm add -D @types/pdf-parse
```

### Step 3: Initialize Prisma

```bash
npx prisma init --datasource-provider postgresql
# Edit prisma/schema.prisma with our schema from TRD
npx prisma migrate dev --name init
npx prisma generate
```

### Step 4: Setup shadcn/ui

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog dropdown-menu input label \
  progress select skeleton tabs textarea toast tooltip
```

### Step 5: Configure Environment

```bash
cp .env.example .env.local
# Fill in all environment variables (see 07-BACKEND-STRUCTURE.md)
```

### Step 6: Setup Git Hooks

```bash
npx husky init
echo "pnpm lint-staged" > .husky/pre-commit
```

---

## 3. Development Workflow

### Branch Strategy

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/upload-component
  │     ├── feature/roast-engine
  │     ├── feature/stripe-integration
  │     ├── fix/pdf-parsing-error
  │     └── chore/update-dependencies
  │
  └── hotfix/critical-bug (emergency fixes)
```

### Commit Convention

```
feat: add resume upload with drag & drop
fix: resolve PDF parsing timeout on large files
chore: update OpenAI SDK to v4.28
docs: add API documentation for roast endpoints
test: add integration tests for payment flow
style: format code with prettier
refactor: extract score parser into separate module
perf: cache OpenAI responses for identical resumes
ci: add e2e tests to CI pipeline
```

### Development Commands

```bash
# Start development server
pnpm dev

# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit          # Unit tests
pnpm test:integration   # Integration tests
pnpm test:e2e          # E2E tests (Playwright)

# Code quality
pnpm lint              # ESLint
pnpm lint:fix          # Auto-fix lint issues
pnpm type-check        # TypeScript checking
pnpm format            # Prettier

# Database
pnpm db:migrate        # Run migrations
pnpm db:seed           # Seed database
pnpm db:studio         # Open Prisma Studio
pnpm db:reset          # Reset database

# Build
pnpm build             # Production build
pnpm start             # Start production server
pnpm analyze           # Bundle analysis
```

---

## 4. Deployment Pipeline

### Environments

| Environment | URL | Branch | Auto-Deploy |
|-------------|-----|--------|-------------|
| **Development** | localhost:3000 | local | N/A |
| **Preview** | *.vercel.app | PR branches | Yes (Vercel) |
| **Staging** | staging.roastmyresume.com | `develop` | Yes |
| **Production** | roastmyresume.com | `main` | Yes |

### Deploy to Vercel

```bash
# Initial setup
npx vercel link

# Environment variables (set in Vercel Dashboard)
# All variables from .env.example must be configured

# Deploy preview
npx vercel

# Deploy production
npx vercel --prod
```

### Deployment Checklist

```markdown
## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit, integration, e2e)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No lint errors (`pnpm lint`)
- [ ] Code reviewed and approved
- [ ] No `console.log` in production code

### Database
- [ ] Migrations tested on staging
- [ ] Backward-compatible schema changes
- [ ] Indexes added for new queries
- [ ] Seed data updated if needed

### Environment
- [ ] All new env vars added to Vercel
- [ ] Secrets rotated if compromised
- [ ] Feature flags configured

### External Services
- [ ] Stripe webhooks configured for production URL
- [ ] OpenAI API key has sufficient quota
- [ ] Email domain verified (Resend)
- [ ] Sentry project configured

### Performance
- [ ] Lighthouse score > 90 on key pages
- [ ] Bundle size within budget (< 200KB initial JS)
- [ ] No N+1 database queries
- [ ] Caching configured for static assets

### Security
- [ ] No secrets in codebase
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] File upload validation in place

### Monitoring
- [ ] Sentry error tracking verified
- [ ] PostHog analytics events firing
- [ ] Uptime monitoring configured
- [ ] Alert rules set up
```

---

## 5. Docker Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/roastmyresume
      - UPSTASH_REDIS_REST_URL=http://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: roastmyresume
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  # Local S3 (MinIO)
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - '9000:9000'
      - '9001:9001'
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 6. Sprint Plan — 4-Week MVP

### Week 1: Foundation 🏗️
| Day | Task | Files |
|-----|------|-------|
| Mon | Project setup, dependencies, Prisma schema | Config files, schema.prisma |
| Tue | Auth system (NextAuth + Google OAuth) | lib/auth/*, (auth)/* pages |
| Wed | Database queries, user service | lib/db/queries/*, lib/services/user.service.ts |
| Thu | File upload (S3 presigned, drag & drop) | components/forms/ResumeUploader.tsx, lib/storage/* |
| Fri | PDF/DOCX parsing | lib/parsers/*, resume.service.ts |

### Week 2: AI Engine 🤖
| Day | Task | Files |
|-----|------|-------|
| Mon | AI prompts (Gordon Ramsay + Nice) | lib/ai/prompts/* |
| Tue | Roast engine with streaming | lib/ai/roast-engine.ts, openai-client.ts |
| Wed | Score parser + content filter | lib/ai/score-parser.ts, content-filter.ts |
| Thu | tRPC routers (roast CRUD) | lib/trpc/routers/roast.router.ts |
| Fri | Roast results page + streaming UI | components/roast/*, (app)/roast/[id]/page.tsx |

### Week 3: Polish & Sharing 🎨
| Day | Task | Files |
|-----|------|-------|
| Mon | Radar chart + score cards | components/roast/RadarChart.tsx, ScoreCard.tsx |
| Tue | Landing page (hero, how it works, CTA) | (marketing)/page.tsx, components/landing/* |
| Wed | Social sharing (URLs, OG images) | lib/services/share.service.ts, share/[id]/* |
| Thu | Rate limiting + error handling | lib/utils/rate-limiter.ts, errors.ts |
| Fri | Responsive design + animations | Tailwind responsive, Framer Motion |

### Week 4: Payments & Launch 🚀
| Day | Task | Files |
|-----|------|-------|
| Mon | Stripe integration (checkout, webhooks) | lib/services/payment.service.ts, api/webhooks/* |
| Tue | Pricing page + upgrade flows | (marketing)/pricing/page.tsx, components/payments/* |
| Wed | Testing (unit + integration + e2e) | __tests__/*, e2e/* |
| Thu | SEO, analytics, monitoring setup | Sentry, PostHog, meta tags |
| Fri | **LAUNCH DAY** 🎉 | Deploy to production |

---

## 7. Launch Checklist

```markdown
## 🚀 Launch Day Checklist

### Pre-Launch (Morning)
- [ ] Final production build passes all tests
- [ ] Database migrations applied to production
- [ ] All environment variables verified in production
- [ ] Stripe production keys configured
- [ ] Stripe webhooks pointing to production URL
- [ ] Domain DNS configured (roastmyresume.com)
- [ ] SSL certificate active
- [ ] Sentry production DSN configured

### Launch
- [ ] Deploy to production (`main` branch)
- [ ] Smoke test: upload resume → generate roast → view results
- [ ] Smoke test: register → login → dashboard
- [ ] Smoke test: payment flow (Stripe test mode or small real payment)
- [ ] Smoke test: share URL works publicly
- [ ] Verify analytics events firing (PostHog)
- [ ] Verify error tracking (Sentry)

### Post-Launch (Within 1 hour)
- [ ] Post on Twitter/X with demo video
- [ ] Post on Reddit (r/webdev, r/SideProject, r/resumes)
- [ ] Submit to Product Hunt
- [ ] Post on Hacker News (Show HN)
- [ ] Post on LinkedIn
- [ ] Monitor error rates in Sentry
- [ ] Monitor server performance
- [ ] Monitor AI API costs

### Post-Launch (Day 1)
- [ ] Respond to all user feedback
- [ ] Fix any critical bugs immediately
- [ ] Track conversion metrics
- [ ] Monitor social media mentions
- [ ] Thank early users
```

---

## 8. Cost Estimation (Monthly)

### MVP Phase (0–1K Users)

| Service | Free Tier | Estimated Cost |
|---------|-----------|---------------|
| Vercel (Hosting) | Hobby plan | $0 |
| Supabase (Database) | Free tier | $0 |
| Upstash Redis | Free tier (10K req/day) | $0 |
| Cloudflare R2 | 10GB free | $0 |
| OpenAI API | Pay as you go | ~$50 |
| Resend (Email) | 100/day free | $0 |
| Domain | Annual | ~$12/yr |
| **Total** | | **~$50/month** |

### Growth Phase (1K–10K Users)

| Service | Plan | Estimated Cost |
|---------|------|---------------|
| Ver](#)

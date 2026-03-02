# 🔧 Technical Requirements Document (TRD)
## RoastMyResume.com

---

## 1. Technology Stack

### Frontend
| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Framework** | Next.js 14 (App Router) | SSR, SEO, API routes, React Server Components |
| **Language** | TypeScript 5.x | Type safety, better DX, fewer runtime errors |
| **Styling** | Tailwind CSS 3.x + shadcn/ui | Rapid UI development, consistent design system |
| **State Management** | Zustand + React Query (TanStack) | Lightweight global state + server state caching |
| **Animations** | Framer Motion | Smooth, performant animations for roast reveal |
| **Charts** | Recharts | Radar/spider charts for roast score |
| **Forms** | React Hook Form + Zod | Performant forms with schema validation |
| **File Upload** | react-dropzone | Drag & drop resume upload |

### Backend
| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Runtime** | Node.js 20 LTS | JavaScript ecosystem, non-blocking I/O |
| **API Framework** | Next.js API Routes + tRPC | End-to-end type safety, no REST boilerplate |
| **Authentication** | NextAuth.js (Auth.js) v5 | OAuth, magic links, session management |
| **Database** | PostgreSQL 16 (via Supabase) | Relational data, JSONB for flexible schemas |
| **ORM** | Prisma 5.x | Type-safe database queries, migrations |
| **Cache** | Redis (Upstash) | Rate limiting, session cache, roast caching |
| **Queue** | BullMQ (Redis-backed) | Background job processing for PDF parsing |
| **File Storage** | AWS S3 / Cloudflare R2 | Resume file storage with presigned URLs |
| **AI/ML** | OpenAI GPT-4o API | Resume analysis and roast generation |
| **PDF Parsing** | pdf-parse + mammoth.js | PDF and DOCX text extraction |
| **Payments** | Stripe | Subscriptions, one-time payments, webhooks |
| **Email** | Resend | Transactional emails, magic links |

### Infrastructure
| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Hosting** | Vercel (Frontend + API) | Zero-config Next.js deployment, edge functions |
| **Database Hosting** | Supabase (Managed Postgres) | Free tier, real-time, auth integration |
| **CDN** | Vercel Edge Network / Cloudflare | Global content delivery |
| **Monitoring** | Sentry | Error tracking, performance monitoring |
| **Analytics** | PostHog | Product analytics, feature flags, A/B testing |
| **Logging** | Axiom | Structured logging, log aggregation |
| **CI/CD** | GitHub Actions | Automated testing, linting, deployment |
| **Container** | Docker | Local development consistency |

---

## 2. Architecture Pattern

### Overall: **Modular Monolith (Next.js Full-Stack)**

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL EDGE                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Next.js    │  │  API Routes │  │   tRPC      │ │
│  │  Frontend    │  │  (REST)     │  │  (Type-safe)│ │
│  │  (RSC + CSR) │  │  /api/*     │  │  /api/trpc  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │         │
│  ┌──────┴────────────────┴────────────────┴──────┐  │
│  │              Service Layer                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐ │  │
│  │  │  Auth    │ │  Roast   │ │  Payment      │ │  │
│  │  │  Service │ │  Engine  │ │  Service      │ │  │
│  │  └────┬─────┘ └────┬─────┘ └───────┬───────┘ │  │
│  └───────┼─────────────┼───────────────┼─────────┘  │
└──────────┼─────────────┼───────────────┼────────────┘
           │             │               │
    ┌──────┴──┐   ┌──────┴──┐     ┌──────┴──┐
    │Supabase │   │ OpenAI  │     │ Stripe  │
    │Postgres │   │ GPT-4o  │     │   API   │
    │+ Redis  │   │   API   │     │         │
    └─────────┘   └─────────┘     └─────────┘
```

### Request Flow for Resume Roast

```
User Upload → [Vercel Edge] → API Route → File Validation
    → S3 Upload (presigned URL)
    → PDF/DOCX Text Extraction (BullMQ worker)
    → AI Roast Generation (OpenAI streaming)
    → Score Calculation
    → Store Results (Postgres)
    �� Stream Response to Client (SSE)
    → Render Roast UI with Animations
```

---

## 3. API Specifications

### 3.1 REST API Endpoints

#### Authentication
```
POST   /api/auth/register          # Email registration
POST   /api/auth/login             # Email login
POST   /api/auth/magic-link        # Send magic link
GET    /api/auth/callback/:provider # OAuth callback
POST   /api/auth/logout            # Logout
GET    /api/auth/me                # Current user
```

#### Resume & Roast
```
POST   /api/resumes/upload         # Upload resume file
POST   /api/resumes/paste          # Paste resume text
GET    /api/resumes/:id            # Get resume details
DELETE /api/resumes/:id            # Delete resume

POST   /api/roasts                 # Generate new roast
GET    /api/roasts/:id             # Get roast result
GET    /api/roasts                 # List user's roasts
GET    /api/roasts/:id/share       # Get shareable roast card
POST   /api/roasts/:id/share       # Generate share image
```

#### Payments
```
POST   /api/payments/checkout      # Create Stripe checkout session
POST   /api/payments/webhook       # Stripe webhook handler
GET    /api/payments/subscription  # Get subscription status
POST   /api/payments/portal        # Create customer portal session
```

#### Admin
```
GET    /api/admin/stats            # Dashboard statistics
GET    /api/admin/users            # User management
GET    /api/admin/roasts           # Roast moderation
```

### 3.2 tRPC Router Structure

```typescript
// Root router
appRouter
  ├── auth
  │   ├── register
  │   ├── login
  │   └── me
  ├── resume
  │   ├── upload
  │   ├── getById
  │   ├── list
  │   └── delete
  ├── roast
  │   ├── generate  (mutation, streaming)
  │   ├── getById
  │   ├── list
  │   └── getShareCard
  ├── payment
  │   ├── createCheckout
  │   ├── getSubscription
  │   └── createPortal
  └── admin
      ├── getStats
      ├── getUsers
      └── moderateRoast
```

---

## 4. Database Schema

### ERD (Entity Relationship Diagram)

```
┌──────────────┐     ┌───────────���──┐     ┌──────────────┐
│    users      │     │   resumes    │     │    roasts    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │────<│ id (PK)      │────<│ id (PK)      │
│ email        │     │ user_id (FK) │     │ resume_id(FK)│
│ name         │     │ file_url     │     │ mode         │
│ avatar_url   │     │ file_type    │     │ score        │
│ password_hash│     │ raw_text     │     │ feedback_json│
│ provider     │     │ parsed_data  │     │ roast_text   │
│ tier         │     │ created_at   │     │ share_url    │
│ stripe_id    │     │ updated_at   │     │ share_image  │
│ created_at   │     │ deleted_at   │     │ created_at   │
│ updated_at   │     └──────────────┘     └──────────────┘
└──────────────┘
        │
        │           ┌──────────────┐     ┌──────────────┐
        └──────────<│  payments    │     │  rate_limits │
                    ├──────────────┤     ├──────────────┤
                    │ id (PK)      │     │ id (PK)      │
                    │ user_id (FK) │     │ user_id (FK) │
                    │ stripe_id    │     │ endpoint     │
                    │ amount       │     │ count        │
                    │ currency     │     │ window_start │
                    │ status       │     │ created_at   │
                    │ type         │     └──────────────┘
                    │ created_at   │
                    └──────────────┘
```

### Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  passwordHash  String?
  provider      String    @default("email") // email, google, github
  tier          Tier      @default(FREE)
  stripeCustomerId String?
  resumes       Resume[]
  payments      Payment[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Resume {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  fileUrl     String?
  fileType    String   // pdf, docx, text
  rawText     String   @db.Text
  parsedData  Json?    // structured resume data
  roasts      Roast[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}

model Roast {
  id           String   @id @default(cuid())
  resumeId     String
  resume       Resume   @relation(fields: [resumeId], references: [id])
  mode         RoastMode
  overallScore Int      // 0-100
  scores       Json     // { impact, clarity, keywords, formatting, grammar, ats }
  roastText    String   @db.Text
  feedbackJson Json     // structured feedback
  shareUrl     String?  @unique
  shareImage   String?
  createdAt    DateTime @default(now())
}

model Payment {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  stripePaymentId String   @unique
  amount          Int      // in cents
  currency        String   @default("usd")
  status          String   // succeeded, pending, failed
  type            String   // one_time, subscription
  createdAt       DateTime @default(now())
}

enum Tier {
  FREE
  ROAST_PASS
  PRO_MONTHLY
  PRO_ANNUAL
}

enum RoastMode {
  GORDON_RAMSAY
  NICE
}
```

---

## 5. Performance Requirements

| Metric | Requirement | Measurement |
|--------|-------------|-------------|
| First Contentful Paint (FCP) | < 1.2s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| API Response Time (p95) | < 500ms | Sentry APM |
| Roast Generation Time | < 10s | Custom metric |
| File Upload Time (5MB) | < 3s | Custom metric |
| Database Query Time (p95) | < 100ms | Prisma metrics |
| Concurrent Users | 10,000+ | Load testing |
| Monthly Active Users | 100,000+ | Infrastructure capacity |

---

## 6. Security Requirements

### 6.1 Authentication & Authorization
- Passwords hashed with **bcrypt** (cost factor 12)
- JWT tokens with **15-minute** access token, **7-day** refresh token
- CSRF protection on all state-changing endpoints
- Rate limiting: 5 login attempts per 15 minutes per IP

### 6.2 Data Protection
- All data encrypted **in transit** (TLS 1.3)
- Resume files encrypted **at rest** (AES-256)
- PII fields encrypted in database
- Resume auto-deletion after 30 days (free tier)
- GDPR: Right to deletion, data export

### 6.3 Input Validation
- File type validation (magic bytes, not just extension)
- File size limits enforced server-side
- All user input sanitized against XSS
- SQL injection prevention via Prisma ORM
- Content Security Policy (CSP) headers

### 6.4 Infrastructure Security
- Environment variables via Vercel encrypted secrets
- Database access restricted to application IP range
- S3 buckets private, access via presigned URLs only
- Dependency vulnerability scanning (Dependabot + Snyk)
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options

---

## 7. Third-Party Integrations

| Service | Purpose | API Type | Rate Limit |
|---------|---------|----------|------------|
| OpenAI GPT-4o | Roast generation | REST + Streaming | 10K RPM |
| Stripe | Payments | REST + Webhooks | 100 RPS |
| Supabase | Database + Auth | REST + Realtime | 1000 RPS |
| Upstash Redis | Caching + Rate Limiting | REST | 10K RPD (free) |
| Cloudflare R2 | File storage | S3-compatible | Unlimited |
| Resend | Email | REST | 100/day (free) |
| Sentry | Error tracking | SDK | 5K events/mo (free) |
| PostHog | Analytics | SDK | 1M events/mo (free) |

---

*Document Version: 1.0*
*Last Updated: 2026-03-02*
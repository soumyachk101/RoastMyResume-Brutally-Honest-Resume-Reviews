# 🏗️ System Design Document
## RoastMyResume.com

---

## 1. High-Level Architecture

```
                         ┌─────────────────────┐
                         │   Cloudflare CDN     │
                         │   (Static Assets +   │
                         │    DDoS Protection)   │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │    Vercel Edge        │
                         │    (Next.js SSR +     │
                         │     Edge Functions)    │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
    ┌─────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
    │  Next.js Pages    │  │  API Routes     │  │  tRPC Routes    │
    │  (React RSC)      │  │  /api/*         │  │  /api/trpc/*    │
    │                    │  │                 │  │                 │
    │  - Landing Page    │  │  - Auth         │  │  - Roast CRUD   │
    │  - Upload Page     │  │  - Webhooks     │  │  - Resume CRUD  │
    │  - Results Page    │  │  - File Upload  │  │  - Payments     │
    │  - Dashboard       │  │                 │  │  - User         │
    │  - Pricing Page    │  │                 │  │                 │
    └──────────────────┘  └─────────────────┘  └────────┬────────┘
                                                         │
              ┌──────────────────────────────────────────┤
              │                                          │
    ┌─────────▼────────┐                      ┌─────────▼────────┐
    │  Service Layer    │                      │  Background Jobs  │
    │                   │                      │  (BullMQ)         │
    │  - RoastService   │                      │                   │
    │  - ResumeService  │                      │  - PDF Parsing    │
    │  - PaymentService │                      │  - Image Gen      │
    │  - UserService    │                      │  - Email Send     │
    │  - ShareService   │                      │  - Cleanup Jobs   │
    └────────┬─────────┘                      └────────┬─────────┘
             │                                          │
    ┌────────┴──────────────────────────────────────────┤
    │                    │                 │             │
┌───▼────┐      ┌───────▼──────┐   ┌──────▼───┐  ┌─────▼────┐
│Supabase│      │  Upstash     │   │OpenAI    │  │Cloudflare│
│Postgres│      │  Redis       │   │GPT-4o    │  │R2 (S3)   │
│        │      │              │   │          │  │          │
│- Users │      │- Rate Limits │   │- Roast   │  │- Resumes │
│- Roasts│      │- Cache       │   │  Gen     │  │- Share   │
│- Pay   │      │- Sessions    │   │- Parse   │  │  Images  │
└────────┘      └──────────────┘   └──────────┘  └──────────┘
```

---

## 2. Component Architecture (Frontend)

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Marketing pages group
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/page.tsx      # Pricing page
│   │   └── about/page.tsx        # About page
│   ├── (app)/                    # App pages group (authenticated)
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   ├── roast/
│   │   │   ├── new/page.tsx      # New roast (upload)
│   │   │   └── [id]/page.tsx     # Roast results
│   │   ├── history/page.tsx      # Roast history
│   │   └── settings/page.tsx     # User settings
│   ├── (auth)/                   # Auth pages group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify/page.tsx
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/
│   │   ├── trpc/[trpc]/
│   │   ├── upload/
│   │   └── webhooks/stripe/
│   ├── share/[id]/page.tsx       # Public share page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── forms/
│   │   ├── ResumeUploader.tsx    # Drag & drop upload
│   │   ├── ModeSelector.tsx      # Gordon/Nice mode toggle
│   │   └── TextPasteArea.tsx     # Paste resume text
│   ├── roast/
│   │   ├── RoastDisplay.tsx      # Streaming roast text
│   │   ├── RoastScore.tsx        # Radar chart
│   │   ├── ScoreCard.tsx         # Individual score card
│   │   └── ShareCard.tsx         # Social share component
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── SEOHead.tsx
│
├── lib/
│   ├── ai/
│   │   ├── prompts.ts            # All AI prompts
│   │   ├── roast-engine.ts       # AI orchestration
│   │   ├── content-filter.ts     # Safety filter
│   │   └── score-parser.ts       # Extract scores from response
│   ├── db/
│   │   ├── prisma.ts             # Prisma client
│   │   └── queries/              # Database query functions
│   ├── services/
│   │   ├── roast.service.ts
│   │   ├── resume.service.ts
│   │   ├── payment.service.ts
│   │   └── share.service.ts
│   ├── utils/
│   │   ├── file-parser.ts        # PDF/DOCX text extraction
│   │   ├── validators.ts         # Zod schemas
│   │   └── helpers.ts
│   ├── trpc/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── routers/
│   └── config/
│       ├── constants.ts
│       └── env.ts
│
├── hooks/
│   ├── useRoast.ts
│   ├── useUpload.ts
│   └── useSubscription.ts
│
├── stores/
│   └── app-store.ts              # Zustand store
│
└── types/
    ├── roast.ts
    ├── resume.ts
    └── user.ts
```

---

## 3. Data Flow Diagrams

### 3.1 Resume Upload & Roast Flow

```
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ User │     │ Frontend  │     │  API     │     │ Services │
└──┬───┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
   │              │                │                 │
   │  Upload PDF  │                │                 │
   │─────────────>│                │                 │
   │              │  Validate File │                 │
   │              │───────────────>│                 │
   │              │                │  Get Presigned  │
   │              │                │  URL (S3)       │
   │              │                │────────────────>│
   │              │                │  <──────────────│
   │              │  Upload to S3  │                 │
   │              │  (Direct)      │                 │
   │              │───────────────────────────────-->│
   │              │                │                 │
   │  Select Mode │                │                 │
   │  (Ramsay)    │                │                 │
   │─────────────>│                │                 │
   │              │  POST /roast   │                 │
   │              │───────────────>│  Parse PDF      │
   │              │                │────────────────>│
   │              │                │  <──────────────│
   │              │                │  Call OpenAI    │
   │              │                │  (Streaming)    │
   │              │                │────────────────>│
   │              │  SSE Stream    │  <──────────────│
   │              │<───────────────│  (chunks)       │
   │  Animated    │                │                 │
   │  Text Reveal │                │  Save to DB     │
   │<─────────────│                │────────────────>│
   │              │                │                 │
   │  View Scores │                │                 │
   │<─────────────│                │                 │
   │              │                │                 │
```

### 3.2 Payment Flow

```
┌──────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ User │    │ Frontend  │    │  API     │    │ Stripe   │    │ Database │
└──┬───┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
   │             │               │               │               │
   │ Click       │               │               │               │
   │ "Upgrade"   │               │               │               │
   │────────────>│               │               │               │
   │             │ Create Session │               │               │
   │             │──────────────>│               │               │
   │             │               │ Create Checkout│               │
   │             │               │──────────────>│               │
   │             │               │ <─────────────│               │
   │             │ Redirect      │  session_url   │               │
   │             │<──────────────│               │               │
   │ Stripe      │               │               │               │
   │ Checkout    │               │               │               │
   │<────────────│               │               │               │
   │             │               │               │               │
   │ Pay         │               │               │               │
   │────────────────────────────────────────────>│               │
   │             │               │  Webhook       │               │
   │             │               │<──────────────│               │
   │             │               │  Update Tier   │               │
   │             │               │──────────────────────────────>│
   │             │               │               │               │
   │ Redirect to │               │               │               │
   │ Success Page│               │               │               │
   │<────────────│               │               │               │
```

---

## 4. Caching Strategy

```
┌────────────────────────────────────────────────────────┐
│                    Cache Layers                         │
│                                                        │
│  Layer 1: Browser Cache                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ - Static assets: 1 year (immutable)              │  │
│  │ - API responses: stale-while-revalidate (5 min)  │  │
│  │ - React Query: 5 min stale time                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Layer 2: Vercel Edge Cache                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ - ISR pages: 60 second revalidation              │  │
│  │ - Share pages: 1 hour cache                      │  │
│  │ - Public API responses: 5 min                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Layer 3: Redis (Upstash)                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ - Roast results: 1 hour (by resume hash + mode)  │  │
│  │ - User sessions: 7 days                          │  │
│  │ - Rate limit counters: sliding window             │  │
│  │ - Subscription status: 5 min                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Layer 4: Database (Postgres)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ - Source of truth for all persistent data         │  │
│  │ - Indexed queries for fast reads                  │  │
│  │ - Connection pooling via Supabase                 │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 5. Rate Limiting Design

```typescript
// Rate Limiting Rules
const RATE_LIMITS = {
  // Anonymous users
  anonymous: {
    roast_generate: { window: "1d", max: 1 },    // 1 roast per day
    file_upload:    { window: "1h", max: 3 },     // 3 uploads per hour
    api_general:    { window: "1m", max: 30 },    // 30 requests per minute
  },
  // Free tier users
  free: {
    roast_generate: { window: "1d", max: 3 },     // 3 roasts per day
    file_upload:    { window: "1h", max: 10 },
    api_general:    { window: "1m", max: 60 },
  },
  // Pro tier users
  pro: {
    roast_generate: { window: "1d", max: 50 },    // 50 roasts per day
    file_upload:    { window: "1h", max: 50 },
    api_general:    { window: "1m", max: 120 },
  },
};

// Implementation: Sliding Window Counter (Redis)
// Key format: rate_limit:{user_id}:{endpoint}:{window_start}
```

---

## 6. Scalability Plan

### Current (MVP): 0 – 10K Users
- Vercel Hobby/Pro plan
- Supabase Free tier
- Single region deployment
- Estimated cost: **$0–$50/month**

### Growth: 10K – 100K Users
- Vercel Pro plan
- Supabase Pro plan
- Redis caching layer (Upstash Pro)
- CDN for share images
- Estimated cost: **$200–$500/month**

### Scale: 100K – 1M Users
- Vercel Enterprise
- Supabase Team plan + Read replicas
- Multi-region deployment
- Background job workers (dedicated)
- AI response caching (aggressive)
- Estimated cost: **$1,000–$3,000/month**

---

## 7. Disaster Recovery

| Component | Backup Strategy | RPO | RTO |
|-----------|----------------|-----|-----|
| Database | Supabase daily backups + WAL | 1 hour | 2 hours |
| File Storage | R2 cross-region replication | 0 (real-time) | < 1 hour |
| Redis Cache | Upstash persistence | N/A (rebuildable) | < 5 min |
| Application | Vercel auto-deploy from Git | 0 | < 5 min |
| AI Service | Fallback to Claude API | N/A | < 1 min |

---

*Document Version: 1.0*
*Last Updated: 2026-03-02*
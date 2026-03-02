# 🏗️ RoastMyResume.com — System Design Document

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Upload   │  │  Roast   │  │  Share   │  │  Dashboard/Auth  │ │
│  │  Page     │  │  Result  │  │  Card    │  │  Pages           │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │              │              │                  │           │
└───────┼──────────────���──────────────┼──────────────────┼───────────┘
        │              │              │                  │
        ▼              ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                         │
│                  (CDN + Edge Functions + SSR)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION SERVER                     │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  API Routes  │  │  tRPC Router │  │  Server Components     │  │
│  │  /api/*      │  │  Type-safe   │  │  (SSR Pages)           │  │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────────┘  │
│         │                │                                        │
│  ┌──────┴────────────────┴─────────────────────────────────────┐ │
│  │                    SERVICE LAYER                              │ │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────────┐  │ │
│  │  │  Auth    │ │  Roast   │ │ Payment│ │  File/Storage    │  │ │
│  │  │  Service │ │  Service │ │ Service│ │  Service         │  │ │
│  │  └────┬─────┘ └────┬─────┘ └───┬────┘ └────────┬─────────┘  │ │
│  └───────┼────────────┼───────────┼────────────────┼────────────┘ │
└──────────┼────────────┼───────────┼────────────────┼──────────────┘
           │            │           │                │
           ▼            ▼           ▼                ▼
    ┌────────────┐ ┌─────────┐ ┌─────────┐  ┌──────────────┐
    │ PostgreSQL │ │  Redis  │ │  Stripe │  │ Cloudflare   │
    │ (Supabase) │ │(Upstash)│ │   API   │  │  R2 Storage  │
    └────────────┘ └────┬────┘ └─────────┘  └──────────────┘
                        │
                        ▼
                  ┌───────────┐
                  │  BullMQ   │
                  │  Worker   │
                  └─────┬─────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        ┌───────────┐     ┌──────────────┐
        │  OpenAI   │     │  Anthropic   │
        │  GPT-4o   │     │  Claude 3.5  │
        │ (Primary) │     │  (Fallback)  │
        └───────────┘     └──────────────┘
```

---

## 2. Request Flow — Resume Roast (End-to-End)

```
User                Browser              Server              Queue              AI
 │                    │                    │                    │                 │
 │  1. Upload Resume  │                    │                    │                 │
 │ ──────────────────>│                    │                    │                 │
 │                    │  2. POST /upload   │                    │                 │
 │                    │ ──────────────────>│                    │                 │
 │                    │                    │  3. Validate file  │                 │
 │                    │                    │  4. Parse resume   │                 │
 │                    │                    │  5. Store in R2    │                 │
 │                    │                    │  6. Create job     │                 │
 │                    │                    │ ──────────────────>│                 │
 │                    │  7. Return jobId   │                    │                 │
 │                    │ <──────────────────│                    │                 │
 │                    │                    │                    │                 │
 │                    │  8. Poll status    │                    │                 │
 │                    │ ──────────────────>│                    │                 │
 │                    │                    │                    │  9. Process job │
 │                    │                    │                    │ ───────────────>│
 │                    │                    │                    │                 │
 │                    │                    │                    │  10. AI response│
 │                    │                    │                    │ <───────────────│
 │                    │                    │                    │                 │
 │                    │                    │  11. Save result   │                 │
 │                    │                    │ <──────────────────│                 │
 │                    │  12. Status: done  │                    │                 │
 │                    │ <──────────────────│                    │                 │
 │                    │                    │                    │                 │
 │                    │  13. GET /roast/id │                    │                 │
 │                    │ ──────────────────>│                    │                 │
 │                    │  14. Roast data    │                    │                 │
 │                    │ <──────────────────│                    │                 │
 │  15. Show results  │                    │                    │                 │
 │ <──────────────────│                    │                    │                 │
```

---

## 3. Component Architecture (Frontend)

```
app/
├── (marketing)/
│   ├── page.tsx                 — Landing page
│   ├── pricing/page.tsx         — Pricing page
│   └── about/page.tsx           — About page
│
├── (app)/
│   ├── layout.tsx               — App layout (with sidebar)
│   ├── upload/page.tsx          — Resume upload page
│   ├── roast/[id]/page.tsx      — Roast results page
│   ├── dashboard/page.tsx       — User dashboard
│   ├── history/page.tsx         — Roast history
│   └── settings/page.tsx        — User settings
│
├── (auth)/
│   ├── login/page.tsx           — Login page
│   └── signup/page.tsx          — Signup page
│
├── share/[token]/page.tsx       — Public shareable roast page
│
└── api/
    ├── auth/[...nextauth]/      — NextAuth handlers
    ├── resume/upload/route.ts   — Upload endpoint
    ├── roast/
    │   ├── generate/route.ts    — Trigger roast generation
    │   ├── [id]/route.ts        — Get roast result
    │   └── [id]/status/route.ts — Poll status
    ├── share/[id]/
    │   ├── route.ts             — Share data
    │   └── image/route.ts       — OG image generation
    ├── stripe/
    │   ├── checkout/route.ts    — Create checkout
    │   └── webhook/route.ts     — Stripe webhooks
    └── user/
        ├── profile/route.ts     — User profile
        └── account/route.ts     — Account management
```

---

## 4. Async Job Processing Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    JOB QUEUE (BullMQ)                      │
│                                                            │
│  Queue: "roast-generation"                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Job {                                               │  │
│  │    id: "roast_abc123",                               │  │
│  │    data: {                                           │  │
│  │      userId: "user_xyz",                             │  │
│  │      resumeText: "...",                              │  │
│  │      mode: "roast",                                  │  │
│  │      industry: "tech"                                │  │
│  │    },                                                │  │
│  │    opts: {                                           │  │
│  │      attempts: 3,                                    │  │
│  │      backoff: { type: 'exponential', delay: 2000 },  │  │
│  │      timeout: 30000                                  │  │
│  │    }                                                 │  │
│  │  }                                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  Worker Process:                                           │
│  1. Dequeue job                                            │
│  2. Construct AI prompt (based on mode + industry)         │
│  3. Call OpenAI GPT-4o                                     │
│     └─ On failure: retry with Claude 3.5 Sonnet           │
│  4. Parse structured JSON response                         │
│  5. Run content safety check                               │
│  6. Calculate scores                                       │
│  7. Save to PostgreSQL                                     │
│  8. Update job status to 'completed'                       │
│  9. Emit WebSocket event (optional)                        │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Rate Limiting Strategy

```
┌─────────────────────────────────────────────────┐
│              RATE LIMITING LAYERS                 │
│                                                   │
│  Layer 1: Vercel Edge (DDoS protection)           │
│  ├─ 100 req/sec per IP                            │
│                                                   │
│  Layer 2: API Rate Limiter (Upstash Redis)        │
│  ├─ Free Users:                                   │
│  │   ├─ 1 roast/day (sliding window)              │
│  │   ├─ 10 API calls/minute                       │
│  │   └─ 100 API calls/hour                        │
│  ├─ Pro Users:                                    │
│  │   ├─ Unlimited roasts                          │
│  │   ├─ 60 API calls/minute                       │
│  │   └─ 1000 API calls/hour                       │
│  └─ Algorithm: Token Bucket                       │
│                                                   │
│  Layer 3: AI API Rate Limiter                     │
│  ├─ Max 50 concurrent AI requests                 │
│  ├─ Queue overflow → 429 with retry-after         │
│  └─ Circuit breaker: 5 failures → open for 60s   │
└─────────────────────────────────────────────────┘
```

---

## 6. Data Flow — Privacy & Security

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   User      │     │  Application │     │   Storage    │
│   Upload    │────>│   Server     │────>│   (R2/S3)   │
│   Resume    │     │              │     │  Encrypted   │
└─────────────┘     └──────┬───────┘     └──────┬───────┘
                           │                     │
                    Parse & Extract          Auto-delete
                    Text Content             after 24h
                           │                     │
                           ▼                     │
                    ┌──────────────┐             │
                    │   AI Engine  │             │
                    │  (Stateless) │             │
                    │  No training │             │
                    │  on user data│             │
                    └──────┬───────┘             │
                           │                     │
                           ▼                     │
                    ┌──────────────┐             │
                    │  PostgreSQL  │◄────────────┘
                    │  (Results    │   Cascade delete
                    │   only, no   │   on account
                    │   raw resume)│   deletion
                    └──────────────┘

Data Lifecycle:
1. Upload: Resume encrypted in transit (TLS 1.3) + at rest (AES-256)
2. Processing: Text extracted, sent to AI (not stored by AI provider)
3. Storage: Only roast results stored; raw resume text deleted after processing
4. File Cleanup: Original file deleted from R2 after 24 hours (cron)
5. Account Deletion: All user data cascade-deleted immediately
```

---

## 7. Caching Strategy

```
┌─────────────────────────────────────────────────────┐
│                  CACHING LAYERS                      │
│                                                      │
│  L1: Browser Cache                                   │
│  ├─ Static assets: 1 year (immutable)                │
│  ├─ API responses: no-cache (personalized)           │
│  └─ Share pages: 1 hour (stale-while-revalidate)     │
│                                                      │
│  L2: Vercel Edge Cache                               │
│  ├─ Marketing pages: ISR (60 seconds)                │
│  ├─ Share cards: ISR (3600 seconds)                  │
│  └─ OG images: Cache for 24 hours                    │
│                                                      │
│  L3: Redis Cache (Upstash)                           │
│  ├─ User session: 24 hours                           │
│  ├─ Roast result: 1 hour (after completion)          │
│  ├─ Rate limit counters: sliding window              │
│  └─ Subscription status: 5 minutes                   │
│                                                      │
│  L4: Database Query Cache                            │
│  ├─ Prisma query caching (connection pool)           │
│  └─ Materialized views for analytics                 │
└─────────────────────────────────────────────────────┘
```

---

## 8. Error Handling & Resilience

```
┌─────────────────────────────────────────────────┐
│           CIRCUIT BREAKER PATTERN                 │
│                                                   │
│  OpenAI API                                       │
│  ├─ Closed (Normal): Requests pass through        │
│  ├─ Open (Failure):  After 5 failures in 60s      │
│  │   └─ Fallback to Anthropic Claude              │
│  └─ Half-Open:       Try 1 request after 60s      │
│      └─ Success → Closed                          │
│      └─ Failure → Open (reset timer)              │
│                                                   │
│  Retry Policy:                                    │
│  ├─ Max retries: 3                                │
│  ├─ Backoff: Exponential (2s, 4s, 8s)             │
│  ├─ Jitter: ±500ms                                │
│  └─ Non-retryable: 400, 401, 403, 413            │
│                                                   │
│  Fallback Chain:                                  │
│  1. GPT-4o (primary)                              │
│  2. Claude 3.5 Sonnet (secondary)                 │
│  3. GPT-4o-mini (degraded experience)             │
│  4. Static "Service busy" response                │
└───────────────────────────────────────────���─────┘
```

---

## 9. Monitoring & Observability

```
┌─────────────────────────────────────────────────┐
│              OBSERVABILITY STACK                  │
│                                                   │
│  Errors & Exceptions:                             │
│  └─ Sentry (with source maps)                    │
│                                                   │
│  Application Metrics:                             │
│  ├─ Roasts generated/minute                       │
│  ├─ AI response latency (P50, P95, P99)           │
│  ├─ Upload success/failure rate                   │
│  ├─ Payment conversion funnel                     │
│  └─ Queue depth & processing time                 │
│                                                   │
│  Business Metrics (PostHog):                      │
│  ├─ DAU / MAU                                     │
│  ├─ Roasts per user                               │
│  ├─ Share rate                                    │
│  ├─ Conversion: Free → Paid                       │
│  └─ Retention (D1, D7, D30)                       │
│                                                   │
│  Alerts:                                          │
│  ├─ Error rate > 5% → PagerDuty                   │
│  ├─ AI latency P95 > 15s → Slack                  │
│  ├─ Queue depth > 100 → Slack                     │
│  ├─ Payment failure rate > 2% → PagerDuty         │
│  └─ Disk/Storage > 80% → Email                    │
└─────────────────────────────────────────────────┘
```
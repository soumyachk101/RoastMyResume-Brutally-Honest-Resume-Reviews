# 🏗️ RoastMyResume.com — System Design Document

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Browser  │  │ Mobile   │  │ API      │  │ Share    │       │
│  │ (React)  │  │ (PWA)    │  │ Clients  │  │ Links   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       └──────────────┼──────────────┼──────────────┘             │
└──────────────────────┼──────────────┼───────────────────────────┘
                       │              │
                  ┌────▼──────────────▼────┐
                  │    Cloudflare DNS +    │
                  │    DDoS Protection     │
                  └───────────┬────────────┘
                              │
                  ┌───────────▼────────────┐
                  │    Vercel Edge Network  │
                  │    (Global CDN)         │
                  │    ┌─────────────────┐  │
                  │    │  Edge Middleware │  │
                  │    │  • Rate Limit   │  │
                  │    │  • Geo Routing  │  │
                  │    │  • Bot Detect   │  │
                  │    └────────┬────────┘  │
                  └────────────┼────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                 │
     ┌────────▼───────┐ ┌─────▼──────┐ ┌───────▼────────┐
     │  SSR/SSG Pages │ │  API Route │ │  Static Assets │
     │  (React SC)    │ │  Handlers  │ │  (CDN Cached)  │
     │                │ │            │ │                 │
     │  • Landing     │ │  • Auth    │ │  • JS Bundles  │
     │  • Dashboard   │ │  • Upload  │ │  • CSS         │
     │  • Results     │ │  • Roast   │ │  • Fonts       │
     │  • Settings    │ │  • Billing │ │  • Animations  │
     └────────────────┘ │  • User    │ │  • Images      │
                        │  • Admin   │ └────────────────┘
                        └─────┬──────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                    │
   ┌──────▼──────┐    ┌──────▼──────┐    ┌───────▼───────┐
   │  PostgreSQL  │    │   Redis     │    │   S3 / R2     │
   │  (Neon)      │    │  (Upstash)  │    │  (Files)      │
   │              │    │             │    │               │
   │  • Users     │    │  • Sessions │    │  • Resumes    │
   │  • Roasts    │    │  • Rate Lim │    │  • OG Images  │
   │  • Billing   │    │  • Job Stat │    │  • Reports    │
   │  • Usage     │    │  • Cache    │    │               │
   └──────────────┘    └─────────────┘    └───────────────┘
          │
          │ (Async Processing)
          │
   ┌──────▼────────────��─────────────────────────────┐
   │                 QStash Queue                      │
   │  ┌────────────────────────────────────────────┐  │
   │  │             Roast Worker                    │  │
   │  │                                            │  │
   │  │  1. Download file from S3                  │  │
   │  │  2. Parse text (pdf-parse / mammoth)       │  │
   │  │  3. Detect sections                        │  │
   │  │  4. ATS compatibility check                │  │
   │  │  5. Build prompt                           │  │
   │  │  6. Call OpenAI / Anthropic                │  │
   │  │  7. Validate output (Zod)                  │  │
   │  │  8. Safety filter                          │  │
   │  │  9. Save results to DB                     │  │
   │  │  10. Update Redis status                   │  │
   │  └────────────────────────────────────────────┘  │
   └──────────────────────────────────────────────────┘
          │
          │ (External Services)
          │
   ┌──────▼──────────────────────────────────────────┐
   │              External APIs                        │
   │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
   │  │ OpenAI   │ │ Stripe   │ │ Resend   │         │
   │  │ GPT-4o   │ │ Payments │ │ Email    │         │
   │  └──────────┘ └──────────┘ └──────────┘         │
   │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
   │  │Anthropic │ │ Sentry   │ │ PostHog  │         │
   │  │ Claude   │ │ Errors   │ │Analytics │         │
   │  └──────────┘ └──────────┘ └──────────┘         │
   └──────────────────────────────────────────────────┘
```

---

## 2. Component Deep Dives

### 2.1 Resume Upload Service

```
Client                     Server                      S3              Queue
  │                          │                          │                │
  │  POST /resume/upload     │                          │                │
  │  (multipart/form-data)   │                          │                │
  │─────────────────────────>│                          │                │
  │                          │                          │                │
  │                          │ Validate file             │                │
  │                          │ (type, size, magic bytes) │                │
  │                          │                          │                │
  │                          │ Generate file key         │                │
  │                          │ Upload to S3              │                │
  │                          │─────────────────────────>│                │
  │                          │        200 OK            │                │
  │                          │<─────────────────────────│                │
  │                          │                          │                │
  │                          │ Create roast record (DB)  │                │
  │                          │ status: 'processing'      │                │
  │                          │                          │                │
  │                          │ Enqueue roast job          │                │
  │                          │──────────────────────────────────────────>│
  │                          │                          │                │
  │  202 Accepted            │                          │                │
  │  { jobId, pollUrl }      │                          │                │
  │<─────────────────────────│                          │                │
  │                          │                          │                │
  │  GET /roast/:id/status   │                          │                │
  │  (polling every 2s)      │                          │                │
  │─────────────────────────>│                          │                │
  │                          │ Check Redis cache         │                │
  │  { status, progress }    │                          │                │
  │<─────────────────────────│                          │                │
```

### 2.2 Rate Limiting Architecture

```typescript
// Sliding window rate limiter using Redis
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limiters for different tiers
const rateLimiters = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),  // 30 req/min
    prefix: 'rl:free',
  }),
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, '1 m'),  // 120 req/min
    prefix: 'rl:pro',
  }),
  team: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(300, '1 m'),  // 300 req/min
    prefix: 'rl:team',
  }),
};

// Daily roast quota limiter
const quotaLimiters = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(3, '1 d'),      // 3 roasts/day
    prefix: 'quota:free',
  }),
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(50, '1 d'),     // 50 roasts/day
    prefix: 'quota:pro',
  }),
  team: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(200, '1 d'),    // 200 roasts/day
    prefix: 'quota:team',
  }),
};
```

### 2.3 Caching Strategy

```
Cache Layer Hierarchy:
═════════════════════

Layer 1: Browser Cache (static assets)
  │  TTL: 1 year (hashed filenames)
  │  Scope: JS, CSS, fonts, images, Lottie animations
  │
Layer 2: Vercel Edge Cache (SSG pages)
  │  TTL: 1 hour (revalidate on demand)
  │  Scope: Landing page, pricing page, public shared roasts
  │
Layer 3: Redis Cache (application data)
  │  TTL: varies
  │  ┌──────────────────────────────────────────┐
  │  │ Job Status    │ TTL: 1 hour              │
  │  │ User Session  │ TTL: 24 hours            │
  │  │ Rate Limits   │ TTL: 1 minute / 1 day    │
  │  │ Roast Results │ TTL: 30 minutes          │
  │  │ Resume Hash   │ TTL: 7 days (dedup)      │
  │  └──────────────────────────────────────────┘
  │
Layer 4: Database (source of truth)
     No TTL — persistent storage
```

---

## 3. Scalability Design

### 3.1 Current Scale (Launch)
```
Users:    1,000 DAU
Roasts:   500/day
Infra:    Single Vercel project, Neon free tier, Upstash free tier
Cost:     ~$50/month (mostly AI API costs)
```

### 3.2 Growth Scale (6 months)
```
Users:    50,000 DAU
Roasts:   5,000/day
Infra:    Vercel Pro, Neon Scale, Upstash Pro
Cost:     ~$2,500/month
```

### 3.3 Large Scale (18 months)
```
Users:    500,000 DAU
Roasts:   50,000/day
Infra:    Vercel Enterprise, Neon Enterprise, dedicated Redis
Changes:
  - Add read replicas for DB
  - Implement result caching aggressively
  - Consider self-hosted inference for cost
  - Add CDN for generated OG images
  - Implement connection pooling (PgBouncer)
Cost:     ~$15,000/month
```

### 3.4 Horizontal Scaling Points

| Component | Scaling Strategy |
|-----------|-----------------|
| **Web Tier** | Vercel auto-scales serverless functions (0 → ∞) |
| **Queue Workers** | QStash handles parallelism automatically |
| **Database** | Neon auto-scales compute; add read replicas at scale |
| **Redis** | Upstash auto-scales; shard at extreme scale |
| **File Storage** | S3/R2 unlimited; add CloudFront CDN |
| **AI APIs** | Rate limit aware; multi-provider load balancing |

---

## 4. Failure Handling & Resilience

### 4.1 Circuit Breaker Pattern (AI Service)

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private resetTimeMs: number = 60_000,
  ) {}
  
  async execute<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.resetTimeMs) {
        this.state = 'half-open';
      } else {
        return fallback();
      }
    }
    
    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      if (this.state === 'half-open' || this.failures >= this.threshold) {
        this.state = 'open';
      }
      return fallback();
    }
  }
  
  private recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
  }
  
  private reset() {
    this.failures = 0;
    this.state = 'closed';
  }
}

// Usage
const openaiBreaker = new CircuitBreaker(5, 60_000);

const result = await openaiBreaker.execute(
  () => callOpenAI(prompt),
  () => callAnthropic(prompt), // Fallback
);
```

### 4.2 Failure Scenarios & Recovery

| Scenario | Detection | Recovery |
|----------|-----------|----------|
| **OpenAI down** | Circuit breaker trips after 5 failures | Auto-fallback to Anthropic Claude |
| **Database down** | Connection error | Queue jobs, retry with exponential backoff |
| **Redis down** | Connection timeout | Fallback to DB for rate limits; skip cache |
| **S3 down** | Upload failure | Retry 3x, then reject upload with friendly error |
| **Stripe webhook missed** | Reconciliation job (hourly) | Re-sync subscription status from Stripe API |
| **Worker crash** | QStash delivery timeout | Automatic retry (3x with backoff) |
| **Malformed AI output** | Zod validation failure | Retry with lower temperature; if 4 fails, return error |

---

## 5. Monitoring & Observability

### 5.1 Dashboards

```
Application Health Dashboard (Sentry)
├── Error Rate (target: < 0.1%)
├── P50/P95/P99 Response Times
├── AI Generation Success Rate
├── Active Users (real-time)
└── Deployment Health

Business Metrics Dashboard (PostHog)
├── Daily Roasts Generated
├── Conversion Funnel (Visit → Upload → Complete → Share → Upgrade)
├── Revenue (MRR, ARPU)
├── Retention Cohorts
├── Feature Usage Heatmap
└── A/B Test Results

Infrastructure Dashboard (Vercel + Axiom)
├── Serverless Function Invocations
├── Edge Cache Hit Rate
├── Database Connections & Query Time
├── Redis Memory Usage
├── S3 Storage & Bandwidth
├── AI API Latency & Token Usage
└── Queue Depth & Processing Time
```

### 5.2 Alerting Rules

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| Error Spike | Error rate > 1% for 5 min | 🔴 Critical | PagerDuty + Slack |
| AI Service Down | Success rate < 90% for 2 min | 🔴 Critical | PagerDuty + Slack |
| High Latency | P95 > 15s for 5 min | 🟡 Warning | Slack |
| Queue Backup | Depth > 100 for 10 min | 🟡 Warning | Slack |
| DB Connections | > 80% of pool for 5 min | 🟡 Warning | Slack |
| Daily Budget | AI API cost > $100/day | 🟡 Warning | Email + Slack |
| Payment Failures | > 5 failures in 1 hour | 🟡 Warning | Slack |

---

## 6. Data Flow & Privacy

```
Resume Lifecycle:
═════════════════

Upload → Encrypted in transit (TLS 1.3)
  │
  ├─ Stored in S3 (encrypted at rest, AES-256)
  │   └─ Retention: 90 days (free), unlimited (paid)
  │
  ├─ Text extracted in-memory (serverless function)
  │   └─ Extracted text stored in DB (encrypted column)
  │
  ├─ Sent to AI API (OpenAI / Anthropic)
  │   └─ OpenAI: Data NOT used for training (API terms)
  │   └─ Anthropic: Data NOT used for training (API terms)
  │
  ├─ AI output stored in DB (encrypted)
  │
  └─ File auto-deleted after retention period
      └─ Cron job runs daily at 2 AM UTC

User Data Rights (GDPR/CCPA):
  - Right to Access: GET /user/me exports all data
  - Right to Delete: DELETE /user/me removes all data + files
  - Right to Portability: Export as JSON
  - Data Processing Agreement: Available upon request
```
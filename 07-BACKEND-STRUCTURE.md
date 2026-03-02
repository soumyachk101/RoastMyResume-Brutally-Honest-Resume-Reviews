# ⚙️ Backend Structure
## RoastMyResume.com — Backend Architecture Deep Dive

---

## 1. Backend Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                              │
│  ┌─────────────┐  ┌──────────────┐  ┌���──────────────┐  │
│  │  REST Routes │  │  tRPC Routes  │  │  Webhooks     │  │
│  │  /api/*      │  │  /api/trpc/*  │  │  /api/webhooks│  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                   │          │
│  ┌──────┴────────────────┴───────────────────┴───────┐  │
│  │              MIDDLEWARE LAYER                       │  │
│  │  ┌──────┐  ┌──────────┐  ┌──────┐  ┌───────────┐ │  │
│  │  │ Auth │  │Rate Limit│  │ CORS │  │ Logging   │ │  │
│  │  └──────┘  └──────────┘  └──────┘  └───────────┘ │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────┴────────────────────────────┐  │
│  │              SERVICE LAYER                         │  │
│  │  ┌────────────��  ┌────────────┐  ┌─────────────┐ │  │
│  │  │   Roast    │  │  Resume    │  │  Payment    │ │  │
│  │  │  Service   │  │  Service   │  │  Service    │ │  │
│  │  └──────┬─────┘  └──────┬─────┘  └──────┬──────┘ │  │
│  │  ┌──────┴─────┐  ┌──────┴─────┐  ┌──────┴──────┐ │  │
│  │  │   Share    │  │   User     │  │   Email     │ │  │
│  │  │  Service   │  │  Service   │  │  Service    │ │  │
│  │  └────────────┘  └────────────┘  └─────────────┘ │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────┴────────────────────────────┐  │
│  │              DATA ACCESS LAYER                     │  │
│  │  ┌────────┐  ┌─────────┐  ┌───────┐  ┌────────┐ │  │
│  │  │ Prisma │  │  Redis  │  │  S3   │  │ OpenAI │ │  │
│  │  │  ORM   │  │  Cache  │  │Client │  │ Client │ │  │
│  │  └────────┘  └─────────┘  └───────┘  └────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Service Layer Details

### 2.1 RoastService — `lib/services/roast.service.ts`

```typescript
/**
 * RoastService — Core business logic for resume roasting
 *
 * Responsibilities:
 * - Orchestrate the roast generation pipeline
 * - Handle mode selection (Gordon Ramsay vs Nice)
 * - Manage AI API calls with streaming
 * - Parse and validate AI responses
 * - Cache results for identical resumes
 * - Track costs and usage
 */

interface RoastService {
  // Core methods
  generateRoast(input: GenerateRoastInput): AsyncGenerator<RoastChunk>;
  getRoastById(id: string): Promise<RoastResult>;
  getUserRoasts(userId: string, pagination: Pagination): Promise<RoastResult[]>;
  deleteRoast(id: string, userId: string): Promise<void>;

  // Share methods
  getShareableRoast(shareId: string): Promise<PublicRoastResult>;
  generateShareImage(roastId: string): Promise<string>;

  // Analytics
  getRoastStats(userId: string): Promise<RoastStats>;
}

interface GenerateRoastInput {
  resumeId: string;
  mode: 'GORDON_RAMSAY' | 'NICE';
  userId?: string;  // Optional for anonymous users
}

interface RoastChunk {
  type: 'text' | 'scores' | 'done' | 'error';
  content: string;
  scores?: RoastScores;
}
```

### 2.2 ResumeService — `lib/services/resume.service.ts`

```typescript
/**
 * ResumeService — Resume upload, parsing, and management
 *
 * Responsibilities:
 * - Generate presigned upload URLs
 * - Validate uploaded files (type, size, content)
 * - Extract text from PDF/DOCX
 * - Store and retrieve resume data
 * - Handle auto-deletion policy
 * - Encrypt PII data
 */

interface ResumeService {
  // Upload flow
  getPresignedUploadUrl(fileType: string): Promise<PresignedUrl>;
  processUploadedFile(fileKey: string, userId?: string): Promise<Resume>;
  createFromText(text: string, userId?: string): Promise<Resume>;

  // CRUD
  getResumeById(id: string): Promise<Resume>;
  getUserResumes(userId: string): Promise<Resume[]>;
  deleteResume(id: string, userId: string): Promise<void>;

  // Parsing
  extractText(fileBuffer: Buffer, fileType: string): Promise<string>;
  parseResumeStructure(rawText: string): Promise<ParsedResume>;

  // Maintenance
  cleanupExpiredResumes(): Promise<number>;  // Returns count deleted
}
```

### 2.3 PaymentService — `lib/services/payment.service.ts`

```typescript
/**
 * PaymentService — Stripe integration and billing management
 *
 * Responsibilities:
 * - Create Stripe checkout sessions
 * - Handle webhook events
 * - Manage subscription lifecycle
 * - Upgrade/downgrade user tiers
 * - Track revenue and refunds
 */

interface PaymentService {
  // Checkout
  createCheckoutSession(input: CheckoutInput): Promise<string>;  // Returns URL
  createCustomerPortalSession(userId: string): Promise<string>;

  // Webhooks
  handleWebhookEvent(event: Stripe.Event): Promise<void>;

  // Subscription management
  getSubscription(userId: string): Promise<SubscriptionInfo>;
  cancelSubscription(userId: string): Promise<void>;

  // Internal
  syncUserTier(stripeCustomerId: string): Promise<void>;
}
```

### 2.4 UserService — `lib/services/user.service.ts`

```typescript
/**
 * UserService — User account management
 *
 * Responsibilities:
 * - User CRUD operations
 * - Profile management
 * - Account deletion (GDPR)
 * - Usage tracking
 */

interface UserService {
  getUserById(id: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  updateProfile(id: string, data: UpdateProfileInput): Promise<User>;
  deleteAccount(id: string): Promise<void>;  // Full data purge
  getRemainingRoasts(userId: string): Promise<number>;
  exportUserData(userId: string): Promise<UserDataExport>;  // GDPR
}
```

### 2.5 ShareService — `lib/services/share.service.ts`

```typescript
/**
 * ShareService — Social sharing and OG image generation
 *
 * Responsibilities:
 * - Generate unique share URLs
 * - Create OG images with score and roast preview
 * - Track share analytics
 * - Handle public share page data
 */

interface ShareService {
  createShareUrl(roastId: string): Promise<string>;
  generateOGImage(roast: RoastResult): Promise<Buffer>;
  getShareAnalytics(roastId: string): Promise<ShareAnalytics>;
  trackShareClick(shareId: string, platform: string): Promise<void>;
}
```

---

## 3. tRPC Router Implementation

### 3.1 Root Router — `lib/trpc/routers/index.ts`

```typescript
// Root tRPC Router
import { router } from '../server';
import { authRouter } from './auth.router';
import { roastRouter } from './roast.router';
import { resumeRouter } from './resume.router';
import { paymentRouter } from './payment.router';
import { adminRouter } from './admin.router';

export const appRouter = router({
  auth: authRouter,
  roast: roastRouter,
  resume: resumeRouter,
  payment: paymentRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
```

### 3.2 Roast Router — `lib/trpc/routers/roast.router.ts`

```typescript
// Roast tRPC Router — Key procedures
export const roastRouter = router({

  generate: protectedProcedure
    .input(z.object({
      resumeId: z.string().cuid(),
      mode: z.enum(['GORDON_RAMSAY', 'NICE']),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Check rate limit
      // 2. Verify resume ownership
      // 3. Check user tier permissions
      // 4. Call RoastService.generateRoast()
      // 5. Stream response back
      // 6. Save results
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      // Returns roast result with scores
    }),

  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      // Returns paginated roast history
    }),

  getShareCard: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ input }) => {
      // Returns public share data (no auth needed)
    }),
});
```

---

## 4. Middleware Stack

```
Request
  │
  ▼
┌─────────────────────────────────────┐
│  1. Vercel Edge Middleware           │
│     - Geo-based routing             │
│     - Bot detection                 │
│     - Basic rate limiting           │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  2. Next.js Middleware               │
│     - Auth session validation        │
│     - Route protection               │
│     - CORS headers                   │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  3. tRPC Middleware                  │
│     - Context creation               │
│     - Auth verification              │
│     - Rate limiting (per-endpoint)   │
│     - Input validation (Zod)         │
│     - Error handling                 │
│     - Logging & metrics              │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  4. Service Layer                    │
│     - Business logic execution       │
│     - Database operations            │
│     - External API calls             │
└─────────────────────────────────────┘
```

### Middleware Implementation

```typescript
// lib/trpc/middleware.ts

// Auth middleware — ensures user is authenticated
export const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: { ...ctx, user: ctx.session.user },
  });
});

// Rate limit middleware — Redis sliding window
export const rateLimited = (limit: number, window: string) =>
  t.middleware(async ({ ctx, next, path }) => {
    const key = `rate_limit:${ctx.user?.id || ctx.ip}:${path}`;
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, parseWindow(window));
    if (current > limit) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again later.`,
      });
    }
    return next();
  });

// Tier check middleware — verifies user has required tier
export const requiresTier = (minTier: Tier) =>
  t.middleware(({ ctx, next }) => {
    if (tierLevel(ctx.user.tier) < tierLevel(minTier)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `This feature requires ${minTier} tier.`,
      });
    }
    return next();
  });

// Logging middleware — structured request logging
export const logged = t.middleware(async ({ ctx, next, path, type }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  logger.info({
    path,
    type,
    userId: ctx.user?.id,
    duration,
    ok: result.ok,
  });
  return result;
});
```

---

## 5. Background Jobs (BullMQ)

```
┌─────────────────────────────────────────────┐
│              Job Queue System                 │
│                                               │
│  Queue: resume-processing                    │
│  ├── Job: parse-pdf                          │
│  ├── Job: parse-docx                         │
│  └── Job: extract-structure                  │
│                                               │
│  Queue: share-generation                     │
│  ├── Job: generate-og-image                  │
│  └── Job: create-share-url                   │
│                                               │
│  Queue: notifications                        │
│  ├── Job: send-welcome-email                 │
│  ├── Job: send-receipt-email                 │
│  └── Job: send-roast-complete-email          │
│                                               │
│  Queue: maintenance                          │
│  ├── Job: cleanup-expired-resumes (cron)     │
│  ├── Job: cleanup-orphan-files (cron)        │
│  └── Job: aggregate-analytics (cron)         │
│                                               │
│  Worker Configuration:                        │
│  - Concurrency: 5 per queue                  │
│  - Retry: 3 attempts with exponential backoff│
│  - Dead letter queue for failed jobs          │
└─────────────────────────────────────────────┘
```

---

## 6. Error Handling Strategy

### Error Hierarchy

```typescript
// lib/utils/errors.ts

// Base application error
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

class RateLimitError extends AppError {
  constructor(public retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMITED', 429);
  }
}

class AIServiceError extends AppError {
  constructor(message: string, public provider: string) {
    super(message, 'AI_SERVICE_ERROR', 502);
  }
}

class PaymentError extends AppError {
  constructor(message: string, public stripeCode?: string) {
    super(message, 'PAYMENT_ERROR', 402);
  }
}
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file type. Please upload a PDF or DOCX file.",
    "details": {
      "field": "file",
      "received": "image/png",
      "expected": ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    },
    "requestId": "req_abc123",
    "timestamp": "2026-03-02T10:30:00Z"
  }
}
```

---

## 7. Environment Variables

```bash
# .env.example — All required environment variables

# ============================================
# APPLICATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RoastMyResume
NODE_ENV=development

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/roastmyresume
DIRECT_URL=postgresql://user:password@localhost:5432/roastmyresume

# ============================================
# AUTHENTICATION (NextAuth)
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ============================================
# AI / OPENAI
# ============================================
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=2500
OPENAI_FALLBACK_MODEL=gpt-4o-mini

# ============================================
# STORAGE (Cloudflare R2 / AWS S3)
# ============================================
S3_ENDPOINT=
S3_REGION=auto
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=roastmyresume-uploads

# ============================================
# REDIS (Upstash)
# ============================================
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ============================================
# PAYMENTS (Stripe)
# ============================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ROAST_PASS=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@roastmyresume.com

# ============================================
# MONITORING
# ============================================
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 8. Database Indexes & Performance

```sql
-- Critical database indexes for performance

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Resumes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_created_at ON resumes(created_at);
CREATE INDEX idx_resumes_deleted_at ON resumes(deleted_at) WHERE deleted_at IS NOT NULL;

-- Roasts
CREATE INDEX idx_roasts_resume_id ON roasts(resume_id);
CREATE INDEX idx_roasts_share_url ON roasts(share_url) WHERE share_url IS NOT NULL;
CREATE INDEX idx_roasts_created_at ON roasts(created_at);

-- Composite index for user's roast history
CREATE INDEX idx_roasts_user_roasts ON roasts(resume_id, created_at DESC);

-- Payments
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);
```

---

*Document Version: 1.0*
*Last Updated: 2026-03-02*
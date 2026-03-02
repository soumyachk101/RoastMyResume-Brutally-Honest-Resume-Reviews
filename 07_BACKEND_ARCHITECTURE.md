# ⚙️ RoastMyResume.com — Backend Architecture

## 1. Service Layer Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                     │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │    REST API Routes    │  │    tRPC Routers           │  │
│  │    /api/*             │  │    Type-safe procedures    │  │
│  └──────────┬───────────┘  └──────────┬───────────────┘  │
│             │                          │                   │
│  ┌──────────┴──────────────────────────┴───────────────┐  │
│  │               MIDDLEWARE LAYER                        │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │  │
│  │  │  Auth   │ │  Rate    │ │ Validate │ │  CORS   │  │  │
│  │  │ Guard   │ │ Limiter  │ │  Input   │ │ Headers │  │  │
│  │  └─────────┘ └──────────┘ └──────────┘ └─────────┘  │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                          │                                 │
│  ┌──────────────────────┴──────────────────────────────┐  │
│  │               SERVICE LAYER                           │  │
│  │                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │ RoastService │  │ AuthService  │  │UserService │  │  │
│  │  │              │  │              │  │            │  │  │
│  │  │ - generate() │  │ - signup()   │  │- getProfile│  │  │
│  │  │ - getById()  │  │ - login()    │  │- update()  │  │  │
│  │  │ - getHistory│  │ - verify()   │  │- delete()  │  │  │
│  │  │ - delete()   │  │ - resetPwd() │  │- export()  │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  │                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │PaymentService│  │ ShareService │  │FileService │  │  │
│  │  │              │  │              │  │            │  │  │
│  │  │- checkout()  │  │- getCard()   │  │- upload()  │  │  │
│  │  │- webhook()   │  │- genImage()  │  │- parse()   │  │  │
│  │  │- portal()    │  │- trackShare()│  │- delete()  │  │  │
│  │  │- getStatus() │  │              │  │- cleanup() │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌──────────────────────┴──────────────────────────────┐    │
│  │              DATA ACCESS LAYER (Prisma)               │    │
│  └───────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Core Service Implementations

### 2.1 RoastService

```typescript
// packages/api/src/services/roast.service.ts

interface RoastService {
  // Generate a new roast
  generate(input: {
    userId: string;
    resumeText: string;
    mode: 'roast' | 'nice';
    industry: string;
  }): Promise<{ jobId: string }>;

  // Get roast by ID
  getById(roastId: string, userId: string): Promise<RoastResult>;

  // Get job status (for polling)
  getStatus(jobId: string): Promise<JobStatus>;

  // Get user's roast history
  getHistory(userId: string, pagination: Pagination): Promise<RoastResult[]>;

  // Delete a roast
  delete(roastId: string, userId: string): Promise<void>;
}
```

#### Generate Roast Flow (Detailed)

```
generate()
├── 1. Validate user quota (free: 1/day, pro: unlimited)
│   ├── Check Redis: `ratelimit:{userId}:roasts:daily`
│   └── If exceeded → throw QuotaExceededError
│
├── 2. Validate resume text
│   ├── Min length: 50 characters
│   ├── Max length: 15,000 characters (truncate)
│   ├── Language detection (English only for MVP)
│   └── If invalid → throw ValidationError
│
├── 3. Create roast record in DB (status: 'pending')
│   └── INSERT INTO roasts (user_id, mode, industry, status)
│
├── 4. Enqueue job to BullMQ
│   └── roastQueue.add('generate', {
│         roastId, userId, resumeText, mode, industry
│       }, { attempts: 3, backoff: exponential })
│
├── 5. Increment daily counter
│   └── Redis: INCR `ratelimit:{userId}:roasts:daily`
│
└── 6. Return { jobId: roastId }
```

### 2.2 AI Integration Layer

```typescript
// packages/ai/src/providers/base.ts

abstract class AIProvider {
  abstract generateRoast(input: AIRoastInput): Promise<AIRoastOutput>;
  abstract checkSafety(content: string): Promise<SafetyResult>;

  // Shared retry logic
  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T>;
}

// packages/ai/src/providers/openai.ts
class OpenAIProvider extends AIProvider {
  async generateRoast(input: AIRoastInput): Promise<AIRoastOutput> {
    const prompt = PromptBuilder.build({
      mode: input.mode,
      industry: input.industry,
      resumeText: input.resumeText,
    });

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.85,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    return ResponseParser.parse(response.choices[0].message.content);
  }
}

// packages/ai/src/index.ts — Orchestrator with circuit breaker
class AIOrchestrator {
  private providers: AIProvider[];
  private circuitBreaker: CircuitBreaker;

  async generateRoast(input: AIRoastInput): Promise<AIRoastOutput> {
    for (const provider of this.providers) {
      try {
        if (this.circuitBreaker.isOpen(provider.name)) continue;

        const result = await provider.generateRoast(input);

        // Safety check
        const safety = await this.safetyCheck(result);
        if (!safety.safe) {
          result = this.sanitize(result, safety.issues);
        }

        this.circuitBreaker.recordSuccess(provider.name);
        return result;
      } catch (error) {
        this.circuitBreaker.recordFailure(provider.name);
        continue; // Try next provider
      }
    }
    throw new AllProvidersFailedError();
  }
}
```

### 2.3 Queue Worker

```typescript
// packages/queue/src/workers/roast-worker.ts

const roastWorker = new Worker('roast-generation', async (job) => {
  const { roastId, userId, resumeText, mode, industry } = job.data;

  try {
    // 1. Update status to 'processing'
    await db.roast.update({
      where: { id: roastId },
      data: { status: 'processing' },
    });

    // 2. Generate roast via AI
    const startTime = Date.now();
    const result = await aiOrchestrator.generateRoast({
      resumeText,
      mode,
      industry,
    });
    const processingMs = Date.now() - startTime;

    // 3. Save result to database
    await db.roast.update({
      where: { id: roastId },
      data: {
        status: 'completed',
        overallScore: result.overallScore,
        roastTitle: result.roastTitle,
        summary: result.summary,
        sections: result.sections,
        topIssues: result.topIssues,
        modelUsed: result.modelUsed,
        tokensUsed: result.tokensUsed,
        processingMs,
        shareToken: generateShareToken(),
      },
    });

    // 4. Cache result in Redis (1 hour)
    await redis.set(
      `roast:${roastId}`,
      JSON.stringify(result),
      'EX',
      3600
    );

    // 5. Track analytics
    posthog.capture({
      distinctId: userId,
      event: 'roast_completed',
      properties: {
        mode,
        industry,
        score: result.overallScore,
        processingMs,
        model: result.modelUsed,
      },
    });

  } catch (error) {
    // Update status to 'failed'
    await db.roast.update({
      where: { id: roastId },
      data: { status: 'failed' },
    });
    throw error; // BullMQ will retry
  }
}, {
  connection: redis,
  concurrency: 10, // Max 10 parallel AI requests
});
```

### 2.4 Payment Service (Stripe)

```typescript
// packages/api/src/services/payment.service.ts

class PaymentService {
  // Create checkout session
  async createCheckout(userId: string, priceId: string): Promise<string> {
    const user = await db.user.findUnique({ where: { id: userId } });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: priceId === SINGLE_ROAST_PRICE ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard?payment=success`,
      cancel_url: `${APP_URL}/pricing?payment=cancelled`,
      metadata: { userId },
    });

    return session.url!;
  }

  // Handle Stripe webhook
  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }
}
```

---

## 3. Middleware Stack

```typescript
// apps/web/middleware.ts (Next.js Edge Middleware)

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min
});

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Rate limiting (API routes only)
  if (path.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, remaining } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  // 2. Auth protection (app routes)
  if (path.startsWith('/dashboard') ||
      path.startsWith('/upload') ||
      path.startsWith('/history') ||
      path.startsWith('/settings')) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=()');

  return response;
}
```

---

## 4. Database Access Patterns

```typescript
// packages/db/src/client.ts — Singleton pattern

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Common queries with optimized includes
export const roastQueries = {
  getByIdWithUser: (id: string) =>
    prisma.roast.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, tier: true } } },
    }),

  getHistoryPaginated: (userId: string, page: number, limit: number) =>
    prisma.roast.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        mode: true,
        overallScore: true,
        roastTitle: true,
        status: true,
        createdAt: true,
      },
    }),

  getExpiredResumes: () =>
    prisma.roast.findMany({
      where: {
        expiresAt: { lt: new Date() },
        resumeUrl: { not: null },
      },
      select: { id: true, resumeUrl: true },
    }),
};
```

---

## 5. Authentication Flow (NextAuth.js)

```typescript
// apps/web/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@roast/db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        return valid ? user : null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tier = user.tier;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.tier = token.tier;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```
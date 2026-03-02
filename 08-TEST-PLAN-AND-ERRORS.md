# 🧪 Test Plan & Error Handling
## RoastMyResume.com

---

## 1. Testing Strategy Overview

```
┌──────────────────────────────────────────────────────┐
│                  Testing Pyramid                      │
│                                                      │
│                     /\                               │
│                    /  \        E2E Tests              │
│                   / E2E\       (Playwright)           │
│                  /──────\      ~20 tests              │
│                 /        \                            │
│                /Integration\   Integration Tests      │
│               /   Tests     \  (Vitest + MSW)         │
│              /───────────────\ ~80 tests              │
│             /                 \                       │
│            /    Unit Tests     \ Unit Tests            │
│           /    (Vitest + RTL)   \ (Vitest)            │
│          /───────────────────────\ ~200 tests         │
│                                                      │
│  Coverage Target: 80%+ (critical paths: 95%+)        │
└──────────────────────────────────────────────────────┘
```

### Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit & integration test runner |
| **React Testing Library** | Component testing |
| **MSW (Mock Service Worker)** | API mocking |
| **Playwright** | End-to-end browser testing |
| **Faker.js** | Test data generation |
| **Stripe Mock** | Payment testing |

---

## 2. Unit Tests

### 2.1 AI Layer Tests

```typescript
// __tests__/lib/ai/roast-engine.test.ts

describe('RoastEngine', () => {
  describe('generateRoast()', () => {
    it('should generate a roast in Gordon Ramsay mode', async () => {
      // Arrange: Mock OpenAI response
      // Act: Call generateRoast with mode = GORDON_RAMSAY
      // Assert: Response contains roast text and scores
    });

    it('should generate feedback in Nice mode', async () => {
      // Arrange: Mock OpenAI response
      // Act: Call generateRoast with mode = NICE
      // Assert: Response is constructive, contains scores
    });

    it('should handle empty resume text gracefully', async () => {
      // Assert: Throws ValidationError
    });

    it('should handle OpenAI API timeout', async () => {
      // Assert: Retries 3 times, then throws AIServiceError
    });

    it('should handle OpenAI rate limit (429)', async () => {
      // Assert: Implements exponential backoff
    });

    it('should fall back to secondary model on primary failure', async () => {
      // Assert: Uses fallback model (gpt-4o-mini or Claude)
    });

    it('should respect max token limit', async () => {
      // Assert: Response within token budget
    });

    it('should stream response chunks correctly', async () => {
      // Assert: Each chunk has correct type and content
    });
  });
});

// __tests__/lib/ai/score-parser.test.ts
describe('ScoreParser', () => {
  it('should extract scores from AI response with json-scores block', () => {
    const response = `Great resume! \`\`\`json-scores\n{"overall_score": 75}\n\`\`\``;
    const scores = parseScores(response);
    expect(scores.overall_score).toBe(75);
  });

  it('should handle missing scores gracefully', () => {
    const response = 'No scores in this response';
    const scores = parseScores(response);
    expect(scores).toEqual(DEFAULT_SCORES);
  });

  it('should validate score ranges (0-100)', () => {
    const response = `\`\`\`json-scores\n{"overall_score": 150}\n\`\`\``;
    expect(() => parseScores(response)).toThrow(ValidationError);
  });

  it('should handle malformed JSON in scores block', () => {
    const response = `\`\`\`json-scores\n{broken json}\n\`\`\``;
    const scores = parseScores(response);
    expect(scores).toEqual(DEFAULT_SCORES); // Fallback
  });
});

// __tests__/lib/ai/content-filter.test.ts
describe('ContentFilter', () => {
  it('should block responses with racial slurs', () => {
    expect(isContentSafe('response with [slur]')).toBe(false);
  });

  it('should allow mild humor about resume content', () => {
    expect(isContentSafe('This resume is blander than unseasoned chicken')).toBe(true);
  });

  it('should block personal appearance comments', () => {
    expect(isContentSafe('Your photo looks terrible')).toBe(false);
  });

  it('should allow Gordon Ramsay-style cooking metaphors', () => {
    expect(isContentSafe('This is RAW! Completely uncooked!')).toBe(true);
  });

  it('should flag high-negativity responses for review', () => {
    const result = filterContent(extremelyNegativeResponse);
    expect(result.flaggedForReview).toBe(true);
  });
});
```

### 2.2 Service Layer Tests

```typescript
// __tests__/lib/services/resume.service.test.ts

describe('ResumeService', () => {
  describe('extractText()', () => {
    it('should extract text from a valid PDF', async () => {
      const buffer = readFileSync('__fixtures__/sample-resume.pdf');
      const text = await resumeService.extractText(buffer, 'pdf');
      expect(text).toContain('John Doe');
      expect(text.length).toBeGreaterThan(100);
    });

    it('should extract text from a valid DOCX', async () => {
      const buffer = readFileSync('__fixtures__/sample-resume.docx');
      const text = await resumeService.extractText(buffer, 'docx');
      expect(text).toContain('Experience');
    });

    it('should throw on corrupted PDF', async () => {
      const buffer = Buffer.from('not a real pdf');
      await expect(resumeService.extractText(buffer, 'pdf'))
        .rejects.toThrow(ValidationError);
    });

    it('should throw on oversized files', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      await expect(resumeService.extractText(largeBuffer, 'pdf'))
        .rejects.toThrow('File size exceeds maximum');
    });

    it('should handle password-protected PDFs', async () => {
      const buffer = readFileSync('__fixtures__/protected-resume.pdf');
      await expect(resumeService.extractText(buffer, 'pdf'))
        .rejects.toThrow('Password-protected files are not supported');
    });

    it('should strip non-printable characters from extracted text', async () => {
      const text = await resumeService.extractText(bufferWithSpecialChars, 'pdf');
      expect(text).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F]/);
    });
  });

  describe('processUploadedFile()', () => {
    it('should create resume record with extracted text', async () => {
      const resume = await resumeService.processUploadedFile('key.pdf', 'user123');
      expect(resume.rawText).toBeDefined();
      expect(resume.userId).toBe('user123');
    });

    it('should work for anonymous users (no userId)', async () => {
      const resume = await resumeService.processUploadedFile('key.pdf');
      expect(resume.userId).toBeNull();
    });
  });

  describe('cleanupExpiredResumes()', () => {
    it('should delete resumes older than 30 days for free users', async () => {
      // Setup: Create resume 31 days ago
      const count = await resumeService.cleanupExpiredResumes();
      expect(count).toBeGreaterThan(0);
    });

    it('should NOT delete resumes for Pro users', async () => {
      // Setup: Create resume 31 days ago for Pro user
      const count = await resumeService.cleanupExpiredResumes();
      expect(count).toBe(0);
    });
  });
});

// __tests__/lib/services/payment.service.test.ts
describe('PaymentService', () => {
  describe('handleWebhookEvent()', () => {
    it('should upgrade user on checkout.session.completed', async () => {
      const event = createStripeEvent('checkout.session.completed', {
        customer: 'cus_123',
        metadata: { userId: 'user_123', tier: 'PRO_MONTHLY' },
      });
      await paymentService.handleWebhookEvent(event);
      const user = await prisma.user.findUnique({ where: { id: 'user_123' } });
      expect(user?.tier).toBe('PRO_MONTHLY');
    });

    it('should downgrade user on subscription cancellation', async () => {
      const event = createStripeEvent('customer.subscription.deleted', {
        customer: 'cus_123',
      });
      await paymentService.handleWebhookEvent(event);
      const user = await getUserByStripeId('cus_123');
      expect(user?.tier).toBe('FREE');
    });

    it('should handle duplicate webhook events idempotently', async () => {
      const event = createStripeEvent('checkout.session.completed', { /*...*/ });
      await paymentService.handleWebhookEvent(event);
      await paymentService.handleWebhookEvent(event); // Duplicate
      // Assert: User tier only set once, no duplicate payment records
    });

    it('should log and ignore unknown event types', async () => {
      const event = createStripeEvent('unknown.event', {});
      await expect(paymentService.handleWebhookEvent(event)).resolves.not.toThrow();
    });
  });
});
```

### 2.3 Utility Tests

```typescript
// __tests__/lib/utils/validators.test.ts

describe('Validators', () => {
  describe('fileUploadSchema', () => {
    it('should accept valid PDF files', () => {
      expect(() => fileUploadSchema.parse({
        type: 'application/pdf',
        size: 5 * 1024 * 1024,
      })).not.toThrow();
    });

    it('should reject files over 10MB', () => {
      expect(() => fileUploadSchema.parse({
        type: 'application/pdf',
        size: 11 * 1024 * 1024,
      })).toThrow();
    });

    it('should reject image files', () => {
      expect(() => fileUploadSchema.parse({
        type: 'image/png',
        size: 1024,
      })).toThrow();
    });

    it('should reject executable files', () => {
      expect(() => fileUploadSchema.parse({
        type: 'application/x-msdownload',
        size: 1024,
      })).toThrow();
    });
  });

  describe('roastModeSchema', () => {
    it('should accept GORDON_RAMSAY', () => {
      expect(roastModeSchema.parse('GORDON_RAMSAY')).toBe('GORDON_RAMSAY');
    });

    it('should accept NICE', () => {
      expect(roastModeSchema.parse('NICE')).toBe('NICE');
    });

    it('should reject invalid modes', () => {
      expect(() => roastModeSchema.parse('MEAN')).toThrow();
    });
  });
});

// __tests__/lib/utils/rate-limiter.test.ts
describe('RateLimiter', () => {
  it('should allow requests within limit', async () => {
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit('user_1', 'roast', { max: 3, window: '1d' });
      expect(result.allowed).toBe(true);
    }
  });

  it('should block requests exceeding limit', async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit('user_1', 'roast', { max: 3, window: '1d' });
    }
    const result = await checkRateLimit('user_1', 'roast', { max: 3, window: '1d' });
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should track limits per-user independently', async () => {
    await checkRateLimit('user_1', 'roast', { max: 1, window: '1d' });
    await checkRateLimit('user_1', 'roast', { max: 1, window: '1d' });
    const result = await checkRateLimit('user_2', 'roast', { max: 1, window: '1d' });
    expect(result.allowed).toBe(true);
  });
});
```

---

## 3. Integration Tests

```typescript
// __tests__/integration/roast-flow.test.ts

describe('Roast Generation Flow (Integration)', () => {
  it('should complete full roast flow: upload → parse → roast → save', async () => {
    // 1. Upload a resume
    const uploadRes = await request(app)
      .post('/api/upload/process')
      .attach('file', '__fixtures__/sample-resume.pdf');
    expect(uploadRes.status).toBe(200);
    const { resumeId } = uploadRes.body;

    // 2. Generate roast
    const roastRes = await request(app)
      .post('/api/trpc/roast.generate')
      .send({ resumeId, mode: 'GORDON_RAMSAY' })
      .set('Authorization', `Bearer ${testToken}`);
    expect(roastRes.status).toBe(200);

    // 3. Verify roast saved in database
    const roast = await prisma.roast.findFirst({
      where: { resumeId },
    });
    expect(roast).not.toBeNull();
    expect(roast?.overallScore).toBeGreaterThanOrEqual(0);
    expect(roast?.overallScore).toBeLessThanOrEqual(100);
  });

  it('should enforce rate limits for free-tier users', async () => {
    // Generate max allowed roasts
    for (let i = 0; i < 3; i++) {
      await generateRoastAsUser(freeUser);
    }
    // Next attempt should be rate limited
    const res = await generateRoastAsUser(freeUser);
    expect(res.status).toBe(429);
  });

  it('should allow unlimited roasts for Pro users', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await generateRoastAsUser(proUser);
      expect(res.status).toBe(200);
    }
  });
});

// __tests__/integration/auth-flow.test.ts
describe('Authentication Flow', () => {
  it('should register a new user with email/password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecureP@ss123',
        name: 'Test User',
      });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should reject duplicate email registration', async () => {
    await registerUser('dupe@example.com');
    const res = await registerUser('dupe@example.com');
    expect(res.status).toBe(409);
  });

  it('should login and return valid session', async () => {
    await registerUser('login@example.com', 'password123');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

// __tests__/integration/payment-webhook.test.ts
describe('Stripe Webhook Integration', () => {
  it('should handle checkout.session.completed and upgrade user', async () => {
    const payload = createWebhookPayload('checkout.session.completed', {
      customer: 'cus_test',
      metadata: { userId: testUser.id, tier: 'PRO_MONTHLY' },
    });
    const signature = generateStripeSignature(payload);

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', signature)
      .send(payload);

    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { id: testUser.id } });
    expect(user?.tier).toBe('PRO_MONTHLY');
  });

  it('should reject webhooks with invalid signature', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'invalid')
      .send({});

    expect(res.status).toBe(400);
  });
});
```

---

## 4. End-to-End Tests (Playwright)

```typescript
// e2e/roast-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Resume Roast Flow', () => {
  test('anonymous user can upload resume and get one free roast', async ({ page }) => {
    await page.goto('/');

    // Click CTA
    await page.click('text=Roast My Resume');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/sample-resume.pdf');

    // Wait for upload
    await expect(page.locator('text=Upload complete')).toBeVisible({ timeout: 10000 });

    // Select Gordon Ramsay mode
    await page.click('text=Gordon Ramsay Mode');

    // Click generate
    await page.click('text=Roast It!');

    // Wait for roast to generate (streaming)
    await expect(page.locator('[data-testid="roast-text"]')).toBeVisible({ timeout: 15000 });

    // Verify score is displayed
    await expect(page.locator('[data-testid="overall-score"]')).toBeVisible();

    // Verify share button exists
    await expect(page.locator('text=Share on Twitter')).toBeVisible();
  });

  test('user can sign up, login, and view roast history', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'SecureP@ss123');
    await page.fill('[name="name"]', 'Test User');
    await page.click('text=Sign Up');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to new roast
    await page.click('text=New Roast');

    // Upload and generate (simplified)
    // ...

    // Check history
    await page.click('text=History');
    await expect(page.locator('[data-testid="roast-history-item"]')).toHaveCount(1);
  });

  test('share page is publicly accessible', async ({ page }) => {
    // Assuming a share URL exists
    await page.goto('/share/test-share-id');

    // Should show roast results without login
    await expect(page.locator('[data-testid="shared-roast"]')).toBeVisible();
    await expect(page.locator('[data-testid="overall-score"]')).toBeVisible();

    // Should show CTA to try it themselves
    await expect(page.locator('text=Roast Your Resume')).toBeVisible();
  });

  test('pricing page shows all tiers and checkout works', async ({ page }) => {
    await page.goto('/pricing');

    // Verify all tiers visible
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=$4.99')).toBeVisible();
    await expect(page.locator('text=$9.99/month')).toBeVisible();

    // Click upgrade (would redirect to Stripe in real test)
    await page.click('text=Get Pro Monthly');
    // In test mode, verify redirect to Stripe checkout
  });

  test('mobile responsive: upload works on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto('/');

    // Mobile menu should work
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('nav[data-testid="mobile-nav"]')).toBeVisible();

    // Upload should work
    await page.click('text=Roast My Resume');
    await expect(page.locator('[data-testid="resume-uploader"]')).toBeVisible();
  });
});
```

---

## 5. Error Catalog

### 5.1 Client-Side Errors (4xx)

| Code | Error | Message | Cause | Resolution |
|------|-------|---------|-------|------------|
| 400 | `INVALID_FILE_TYPE` | "Please upload a PDF or DOCX file" | User uploaded unsupported file | Show supported formats |
| 400 | `FILE_TOO_LARGE` | "File size must be under 10MB" | File exceeds size limit | Compress or simplify resume |
| 400 | `EMPTY_RESUME` | "We couldn't extract any text from your resume" | PDF is image-only or empty | Suggest re-saving as text PDF |
| 400 | `INVALID_INPUT` | Varies | Zod validation failure | Show field-specific errors |
| 401 | `UNAUTHENTICATED` | "Please sign in to continue" | Missing/expired session | Redirect to login |
| 403 | `TIER_REQUIRED` | "This feature requires Pro plan" | Feature locked behind paywall | Show upgrade prompt |
| 403 | `FORBIDDEN` | "You don't have access to this resource" | Accessing another user's data | N/A |
| 404 | `NOT_FOUND` | "Resume/Roast not found" | Invalid ID or deleted resource | Show 404 page |
| 409 | `EMAIL_EXISTS` | "An account with this email already exists" | Duplicate registration | Suggest login instead |
| 422 | `UNPROCESSABLE` | "We couldn't process this resume" | Corrupted or password-protected file | Suggest different format |
| 429 | `RATE_LIMITED` | "You've reached your daily limit. Upgrade for more!" | Rate limit exceeded | Show upgrade CTA or wait time |

### 5.2 Server-Side Errors (5xx)

| Code | Error | Message | Cause | Resolution |
|------|-------|---------|-------|------------|
| 500 | `INTERNAL_ERROR` | "Something went wrong. Please try again." | Unhandled exception | Log to Sentry, show retry |
| 502 | `AI_SERVICE_ERROR` | "Our AI is taking a coffee break. Please retry." | OpenAI API failure | Retry with fallback model |
| 502 | `AI_TIMEOUT` | "Response took too long. Please try again." | OpenAI timeout (>30s) | Retry |
| 502 | `AI_CONTENT_BLOCKED` | "Our AI generated inappropriate content. Regenerating..." | Safety filter triggered | Auto-retry with adjusted prompt |
| 503 | `SERVICE_UNAVAILABLE` | "We're under heavy load. Please try in a few minutes." | System overload | Show queue position or wait time |
| 503 | `STORAGE_ERROR` | "File upload temporarily unavailable" | S3/R2 outage | Retry with exponential backoff |
| 503 | `DATABASE_ERROR` | "Something went wrong. Please try again." | Database connection issue | Retry |

### 5.3 Payment-Specific Errors

| Code | Error | Message | Cause |
|------|-------|---------|-------|
| 402 | `PAYMENT_FAILED` | "Payment was declined. Please try another card." | Card declined |
| 402 | `PAYMENT_EXPIRED` | "Your payment session has expired. Please try again." | Checkout session timeout |
| 402 | `SUBSCRIPTION_PAST_DUE` | "Your subscription payment failed. Please update your card." | Recurring payment failed |
| 402 | `CARD_DECLINED` | "Your card was declined." | Insufficient funds, etc. |

---

## 6. Test Data & Fixtures

### Fixture Files

```
__fixtures__/
├── resumes/
│   ├── sample-good-resume.pdf        # Well-formatted, high-quality resume
│   ├── sample-bad-resume.pdf         # Poorly formatted, weak content
│   ├── sample-resume.docx            # DOCX format resume
│   ├── sample-resume-long.pdf        # 3-page resume
│   ├── sample-resume-minimal.pdf     # Very short, 1 section
│   ├── protected-resume.pdf          # Password-protected PDF
│   ├── corrupted-file.pdf            # Corrupted/invalid PDF
│   ├── image-only-resume.pdf         # Scanned image, no text layer
│   └── not-a-resume.pdf              # Random PDF (not a resume)
├── api-responses/
│   ├── openai-roast-response.json    # Mock OpenAI roast
│   ├── openai-nice-response.json     # Mock OpenAI nice review
│   ├── openai-error-429.json         # Rate limit error
│   ├── openai-error-500.json         # Server error
│   └── stripe-webhook-events/
│       ├── checkout-completed.json
│       ├── subscription-deleted.json
│       └── payment-failed.json
└── users/
    ���── free-user.json
    ├── pro-user.json
    └── admin-user.json
```

---

## 7. CI/CD Test Pipeline

```yaml
# .github/workflows/ci.yml

name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
      - run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps
      - run: pnpm build
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest
    needs: [lint, unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

---

## 8. Monitoring & Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | 5xx errors > 5% of requests for 5 min | Critical | Page on-call |
| AI API Down | OpenAI failures > 50% for 2 min | Critical | Auto-switch to fallback |
| Slow Roast Gen | p95 > 15 seconds for 10 min | Warning | Investigate, scale |
| Payment Failures | Webhook errors > 3 in 5 min | High | Alert + manual review |
| Database Slow | Query p95 > 500ms for 5 min | Warning | Check indexes, connections |
| Disk Usage | S3 storage > 80% of budget | Warning | Review cleanup cron |
| Rate Limit Spike | 429 responses > 100/min | Info | Monitor for abuse |

---

*Document Version: 1.0*
*Last Updated: 2026-03-02*
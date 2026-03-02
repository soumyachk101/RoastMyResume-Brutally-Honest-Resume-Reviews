# 🔧 RoastMyResume.com — Technical Requirements Document (TRD)

## 1. Overview

This document defines the technical architecture, stack, infrastructure, and engineering requirements for building RoastMyResume.com — an AI-powered resume roasting platform.

---

## 2. Tech Stack

### Frontend
| Layer | Technology | Justification |
|-------|-----------|---------------|
| Framework | **Next.js 14 (App Router)** | SSR, SEO, API routes, React Server Components |
| Language | **TypeScript** | Type safety, better DX |
| Styling | **Tailwind CSS + shadcn/ui** | Rapid UI development, consistent design |
| State Management | **Zustand** | Lightweight, simple, no boilerplate |
| Forms | **React Hook Form + Zod** | Performant forms with schema validation |
| File Upload | **react-dropzone** | Drag-and-drop resume upload |
| Animations | **Framer Motion** | Smooth roast reveal animations |
| Charts | **Recharts** | Score visualization |
| Social Share | **html-to-image + share APIs** | Generate shareable roast cards |

### Backend
| Layer | Technology | Justification |
|-------|-----------|---------------|
| Runtime | **Node.js 20 LTS** | JavaScript ecosystem consistency |
| Framework | **Next.js API Routes + tRPC** | End-to-end type safety |
| Language | **TypeScript** | Consistency with frontend |
| ORM | **Prisma** | Type-safe database access |
| Database | **PostgreSQL (Supabase)** | Robust, scalable, managed |
| Cache | **Redis (Upstash)** | Rate limiting, session cache, job queue |
| File Storage | **AWS S3 / Cloudflare R2** | Resume file storage (encrypted) |
| Queue | **BullMQ (Redis-backed)** | Async roast job processing |
| Email | **Resend** | Transactional emails |

### AI & Processing
| Layer | Technology | Justification |
|-------|-----------|---------------|
| LLM | **OpenAI GPT-4o** | Best quality roasts |
| Fallback LLM | **Anthropic Claude 3.5 Sonnet** | Redundancy, cost optimization |
| Resume Parser | **pdf-parse + mammoth.js** | PDF and DOCX text extraction |
| OCR Fallback | **Tesseract.js** | Scanned/image-based PDFs |
| Content Safety | **OpenAI Moderation API** | Filter harmful content |

### Infrastructure
| Layer | Technology | Justification |
|-------|-----------|---------------|
| Hosting | **Vercel** | Optimized for Next.js |
| Database | **Supabase (PostgreSQL)** | Managed, auto-backups |
| CDN | **Vercel Edge / Cloudflare** | Global distribution |
| Monitoring | **Sentry** | Error tracking |
| Analytics | **PostHog** | Product analytics, feature flags |
| APM | **Vercel Speed Insights** | Performance monitoring |
| CI/CD | **GitHub Actions** | Automated testing + deployment |
| Secrets | **Vercel Environment Variables** | Secure secret management |

### Third-Party Services
| Service | Purpose |
|---------|---------|
| **Stripe** | Payments & subscriptions |
| **NextAuth.js (Auth.js)** | Authentication (Google OAuth, Email) |
| **Upstash** | Serverless Redis (rate limiting) |
| **Resend** | Email delivery |
| **Cloudflare R2** | File storage |
| **PostHog** | Analytics & A/B testing |

---

## 3. System Requirements

### 3.1 Performance Requirements

| Metric | Requirement |
|--------|-------------|
| Page Load (LCP) | < 2.5 seconds |
| Time to Interactive (TTI) | < 3 seconds |
| Resume Upload Time | < 3 seconds (5MB file) |
| Resume Parse Time | < 2 seconds |
| AI Roast Generation (P50) | < 5 seconds |
| AI Roast Generation (P95) | < 10 seconds |
| API Response Time (non-AI) | < 200ms |
| Uptime SLA | 99.9% |

### 3.2 Scalability Requirements

| Metric | Requirement |
|--------|-------------|
| Concurrent Users | 1,000+ |
| Daily Roasts | 10,000+ |
| Database Connections | Pool of 20 (scalable) |
| File Storage | 100GB+ (auto-purged after 24h) |

### 3.3 Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| Data Encryption at Rest | AES-256 (S3/R2 server-side encryption) |
| Data Encryption in Transit | TLS 1.3 |
| Resume Auto-Deletion | Cron job: delete after 24 hours |
| Authentication | OAuth 2.0 + JWT (HttpOnly cookies) |
| Rate Limiting | 10 req/min (free), 60 req/min (paid) |
| Input Sanitization | Zod validation + DOMPurify |
| CORS | Strict origin allowlist |
| CSP Headers | Strict Content Security Policy |
| SQL Injection Prevention | Prisma parameterized queries |
| XSS Prevention | React auto-escaping + CSP |
| GDPR Compliance | Data export, deletion on request |
| SOC 2 Alignment | Audit logging, access controls |

---

## 4. API Specifications

### 4.1 REST/tRPC Endpoints

```
# Authentication
POST   /api/auth/signup          — Register new user
POST   /api/auth/signin          — Login (email/password)
GET    /api/auth/session         — Get current session
POST   /api/auth/google          — Google OAuth callback

# Resume & Roast
POST   /api/resume/upload        — Upload resume file
POST   /api/roast/generate       — Generate roast (async)
GET    /api/roast/:id            — Get roast result
GET    /api/roast/:id/status     — Poll roast job status
GET    /api/roast/history        — Get user's roast history
DELETE /api/roast/:id            — Delete a roast

# Sharing
GET    /api/share/:id            — Get shareable roast card data
GET    /api/share/:id/image      — Generate OG image for roast

# Payments
POST   /api/stripe/checkout      — Create Stripe checkout session
POST   /api/stripe/webhook       — Stripe webhook handler
GET    /api/stripe/subscription  — Get subscription status
POST   /api/stripe/portal        — Create customer portal session

# User
GET    /api/user/profile         — Get user profile
PATCH  /api/user/profile         — Update user profile
DELETE /api/user/account         — Delete account + all data (GDPR)
```

### 4.2 Request/Response Examples

#### Upload Resume
```json
// POST /api/resume/upload
// Content-Type: multipart/form-data

// Request
{
  "file": "<binary>",  // PDF, DOCX, or TXT
  "mode": "roast" | "nice",
  "industry": "tech" | "finance" | "healthcare" | "general"
}

// Response (202 Accepted)
{
  "jobId": "roast_abc123",
  "status": "processing",
  "estimatedTime": 8,
  "pollUrl": "/api/roast/roast_abc123/status"
}
```

#### Get Roast Result
```json
// GET /api/roast/roast_abc123

// Response (200 OK)
{
  "id": "roast_abc123",
  "status": "completed",
  "mode": "roast",
  "overallScore": 42,
  "roastTitle": "Did a Toddler Write This?",
  "summary": "I've seen better resumes from people who listed 'breathing' as a skill...",
  "sections": [
    {
      "name": "Professional Summary",
      "score": 30,
      "roast": "Your summary says nothing. It's like a movie trailer that's just 30 seconds of black screen.",
      "suggestions": [
        "Lead with a quantified achievement",
        "Remove 'hardworking team player' — everyone says that",
        "Mention your target role specifically"
      ]
    },
    {
      "name": "Work Experience",
      "score": 55,
      "roast": "You 'managed projects' and 'collaborated with teams.' Groundbreaking. So does every human with a job.",
      "suggestions": [
        "Use the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]",
        "Add metrics: revenue, users, efficiency gains",
        "Remove duties, add achievements"
      ]
    }
    // ... more sections
  ],
  "topIssues": [
    "No quantified achievements anywhere",
    "Generic buzzwords overload",
    "Skills section is a keyword dump"
  ],
  "shareCard": {
    "imageUrl": "/api/share/roast_abc123/image",
    "shareText": "My resume just got ROASTED 🔥 Score: 42/100. Think you can do better? RoastMyResume.com"
  },
  "createdAt": "2026-03-02T10:30:00Z"
}
```

---

## 5. Database Schema

```sql
-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255),
  avatar_url    TEXT,
  auth_provider VARCHAR(50) NOT NULL, -- 'email', 'google'
  password_hash TEXT, -- NULL for OAuth users
  tier          VARCHAR(20) DEFAULT 'free', -- 'free', 'pro', 'lifetime'
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  roasts_today  INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Roasts
CREATE TABLE roasts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  mode          VARCHAR(20) NOT NULL, -- 'roast', 'nice'
  industry      VARCHAR(50) DEFAULT 'general',
  status        VARCHAR(20) DEFAULT 'pending', -- 'pending','processing','completed','failed'
  overall_score INT,
  roast_title   TEXT,
  summary       TEXT,
  sections      JSONB, -- Array of section roasts
  top_issues    JSONB, -- Array of strings
  resume_url    TEXT, -- S3/R2 URL (encrypted)
  resume_text   TEXT, -- Extracted text (deleted after 24h)
  share_token   VARCHAR(64) UNIQUE,
  model_used    VARCHAR(50), -- 'gpt-4o', 'claude-3.5-sonnet'
  tokens_used   INT,
  processing_ms INT, -- Time to generate roast
  created_at    TIMESTAMP DEFAULT NOW(),
  expires_at    TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

-- Payments
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(255),
  amount_cents    INT NOT NULL,
  currency        VARCHAR(3) DEFAULT 'usd',
  type            VARCHAR(20), -- 'subscription', 'one_time'
  status          VARCHAR(20), -- 'succeeded', 'failed', 'refunded'
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Share Analytics
CREATE TABLE share_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roast_id    UUID REFERENCES roasts(id) ON DELETE CASCADE,
  platform    VARCHAR(50), -- 'twitter', 'linkedin', 'copy_link'
  referral_clicks INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Rate Limiting (backup to Redis)
CREATE TABLE rate_limits (
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  count       INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Indexes
CREATE INDEX idx_roasts_user_id ON roasts(user_id);
CREATE INDEX idx_roasts_status ON roasts(status);
CREATE INDEX idx_roasts_created_at ON roasts(created_at);
CREATE INDEX idx_roasts_share_token ON roasts(share_token);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_share_events_roast_id ON share_events(roast_id);
```

---

## 6. Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=https://roastmyresume.com
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/roastmyresume

# Redis
REDIS_URL=redis://...upstash.io:6379

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL_PRIMARY=gpt-4o
AI_MODEL_FALLBACK=claude-3-5-sonnet-20241022

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://roastmyresume.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=resumes
R2_PUBLIC_URL=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_SINGLE_ROAST_PRICE_ID=price_...

# Email
RESEND_API_KEY=re_...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 7. Non-Functional Requirements

### 7.1 Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigable
- Screen reader compatible (ARIA labels)
- Color contrast ratio > 4.5:1

### 7.2 Internationalization (Future)
- i18n-ready architecture (next-intl)
- Initial launch: English only
- V2: Spanish, French, German, Hindi

### 7.3 Browser Support
| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| Mobile Safari | iOS 15+ |
| Chrome Android | Last 2 versions |

### 7.4 SEO Requirements
- Server-side rendering for all public pages
- Dynamic OG images for shared roasts
- Structured data (JSON-LD) for FAQ pages
- Sitemap.xml + robots.txt
- Core Web Vitals: All "Good"
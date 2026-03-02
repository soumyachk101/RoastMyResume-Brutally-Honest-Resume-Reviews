# 📂 Code Structure Design
## RoastMyResume.com — Full Project Structure

---

## 1. Root Directory Structure

```
roast-my-resume/
│
├── .github/                      # GitHub configuration
│   ├── workflows/
│   │   ├── ci.yml                # CI pipeline (lint, test, build)
│   │   ├── deploy-preview.yml    # Preview deployment on PR
│   │   └── deploy-prod.yml       # Production deployment
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Database seed data
│
├── public/                       # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   ├── og-image.png              # Default OG image
│   └── fonts/
│       └── inter-var.woff2
│
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   ├── components/               # React components
│   ├── lib/                      # Core business logic
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # State management
│   ├── types/                    # TypeScript types
│   ├── styles/                   # Global styles
│   └── __tests__/                # Test files mirror
│
├── scripts/                      # Utility scripts
│   ├── setup-db.sh               # Database setup
│   ├── seed-data.ts              # Seed script
│   └── generate-share-image.ts   # OG image generation
│
├── docs/                         # Documentation
│   ├── 01-PRD.md
│   ├── 02-TRD.md
│   ├── 03-AI-INSTRUCTIONS.md
│   ├── 04-SYSTEM-DESIGN.md
│   ├── 05-SOR.md
│   ├── 06-CODE-STRUCTURE.md
│   ├── 07-BACKEND-STRUCTURE.md
│   ├── 08-TEST-PLAN.md
│   └── 09-STITCH-MASTER.md
│
├── docker-compose.yml            # Local development services
├── Dockerfile                    # Production Dockerfile
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment (gitignored)
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── postcss.config.js             # PostCSS configuration
├── vitest.config.ts              # Vitest configuration
├── package.json                  # Dependencies
├── pnpm-lock.yaml                # Lock file
├── LICENSE                       # MIT License
└── README.md                     # Project README
```

---

## 2. Detailed `src/` Structure

```
src/
│
├── app/                              # Next.js 14 App Router
│   │
│   ├── layout.tsx                    # Root layout (providers, fonts, analytics)
│   ├── globals.css                   # Tailwind + global CSS
│   ├── not-found.tsx                 # Custom 404 page
│   ├── error.tsx                     # Global error boundary
│   ├── loading.tsx                   # Global loading state
│   │
│   ├── (marketing)/                  # Marketing pages (public)
│   │   ├── layout.tsx                # Marketing layout (header + footer)
│   │   ├── page.tsx                  # Landing page / Homepage
│   │   ├── pricing/
│   │   │   └── page.tsx              # Pricing page
│   │   ├── about/
│   │   │   └── page.tsx              # About page
│   │   ├── blog/
│   │   │   ├── page.tsx              # Blog listing
│   │   │   └── [slug]/page.tsx       # Blog post
│   │   └── examples/
│   │       └── page.tsx              # Example roasts (SEO content)
│   │
│   ├── (auth)/                       # Authentication pages
│   │   ├── layout.tsx                # Centered auth layout
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── register/
│   │   │   └── page.tsx              # Registration page
│   │   ├── verify/
│   │   │   └── page.tsx              # Email verification
│   │   ├── forgot-password/
│   │   │   └── page.tsx              # Forgot password
│   │   └── reset-password/
│   │       └── page.tsx              # Reset password
│   │
│   ├── (app)/                        # Main application (authenticated)
│   │   ├── layout.tsx                # App layout (sidebar + header)
│   │   ├── dashboard/
│   │   │   └── page.tsx              # User dashboard
│   │   ├── roast/
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # New roast (upload + mode select)
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Roast results page
│   │   │       └── loading.tsx       # Loading skeleton
│   │   ├── history/
│   │   │   └── page.tsx              # Roast history
│   │   ├── reports/
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Deep dive report
│   │   └── settings/
│   │       ├── page.tsx              # General settings
│   │       ├── billing/
│   │       │   └── page.tsx          # Billing & subscription
│   │       └── privacy/
│   │           └── page.tsx          # Privacy & data
│   │
│   ├── share/                        # Public share pages
│   │   └── [id]/
│   │       ├── page.tsx              # Shareable roast result
│   │       └── opengraph-image.tsx   # Dynamic OG image generation
│   │
│   └── api/                          # API Routes
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts          # NextAuth handler
│       ├── trpc/
│       │   └── [trpc]/
│       │       └── route.ts          # tRPC handler
│       ├── upload/
│       │   ├── presigned/
│       │   │   └── route.ts          # Get presigned upload URL
│       │   └── process/
│       │       └── route.ts          # Process uploaded file
│       ├── webhooks/
│       │   └── stripe/
│       │       └── route.ts          # Stripe webhook handler
│       └── cron/
│           └── cleanup/
│               └── route.ts          # Scheduled cleanup job
│
├── components/                       # React Components
│   │
│   ├── ui/                           # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   └── tooltip.tsx
│   │
│   ├── forms/                        # Form components
│   │   ├── ResumeUploader.tsx        # Drag & drop file upload
│   │   ├── TextPasteInput.tsx        # Paste resume text
│   │   ├── ModeSelector.tsx          # Gordon Ramsay / Nice toggle
│   │   ├── LoginForm.tsx             # Login form
│   │   ├── RegisterForm.tsx          # Registration form
│   │   └── JobDescriptionInput.tsx   # JD paste (premium)
│   │
│   ├── roast/                        # Roast-specific components
│   │   ├── RoastDisplay.tsx          # Main roast text (streaming)
│   │   ├── RoastScore.tsx            # Overall score badge
│   │   ├── RadarChart.tsx            # 6-dimension radar chart
│   │   ├── ScoreBreakdown.tsx        # Score cards grid
│   │   ├── ScoreCard.tsx             # Individual score card
│   │   ├── ShareCard.tsx             # Social share preview card
│   │   ├── ShareButtons.tsx          # Share to social media
│   │   ├── RoastSkeleton.tsx         # Loading skeleton
│   │   ├── RoastError.tsx            # Error state
│   │   └── RoastHistory.tsx          # History list item
│   │
│   ├── layout/                       # Layout components
│   │   ├── MarketingHeader.tsx       # Marketing pages header
│   │   ├── MarketingFooter.tsx       # Marketing pages footer
│   │   ├── AppHeader.tsx             # App header with user menu
│   │   ├── AppSidebar.tsx            # App navigation sidebar
│   │   ├── MobileNav.tsx             # Mobile navigation
│   │   └── ThemeToggle.tsx           # Dark/light mode toggle
│   │
│   ├── landing/                      # Landing page sections
│   │   ├── HeroSection.tsx           # Hero with CTA
│   │   ├── HowItWorks.tsx            # 3-step process
│   │   ├── ExampleRoast.tsx          # Interactive demo
│   │   ├── Testimonials.tsx          # User testimonials
│   │   ├── PricingSection.tsx        # Pricing cards
│   │   ├── FAQSection.tsx            # Frequently asked questions
│   │   └── CTASection.tsx            # Final call to action
│   │
│   ├── payments/                     # Payment components
│   │   ├── PricingCard.tsx           # Individual pricing card
│   │   ├── CheckoutButton.tsx        # Stripe checkout trigger
│   │   ├── SubscriptionBadge.tsx     # Current plan badge
│   │   └── BillingPortalButton.tsx   # Stripe portal link
│   │
│   └── shared/                       # Shared/utility components
│       ├── ErrorBoundary.tsx         # Error boundary wrapper
│       ├── LoadingSpinner.tsx        # Loading spinner
│       ├── ConfirmDialog.tsx         # Confirmation modal
│       ├── FileIcon.tsx              # File type icon
│       ├── EmptyState.tsx            # Empty state illustration
│       ├── Badge.tsx                 # Status badge
│       └── Providers.tsx             # Context providers wrapper
│
├── lib/                              # Core Business Logic
│   │
│   ├── ai/                           # AI/ML Layer
│   │   ├── prompts/
│   │   │   ├── index.ts              # Prompt exports
│   │   │   ├── gordon-ramsay.ts      # Ramsay mode system prompt
│   │   │   ├── nice-mode.ts          # Nice mode system prompt
│   │   │   ├── pre-process.ts        # Resume pre-processing prompt
│   │   │   └── share-card.ts         # Share card text extraction
│   │   ├── roast-engine.ts           # Main AI orchestration
│   │   ├── openai-client.ts          # OpenAI API client wrapper
│   │   ├── content-filter.ts         # Safety/content moderation
│   │   ├── score-parser.ts           # Extract scores from AI response
│   │   ├── token-counter.ts          # Token usage tracking
│   │   └── fallback.ts              # Fallback AI provider (Claude)
│   │
│   ├── db/                           # Database Layer
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── queries/
│   │   │   ├── users.ts              # User queries
│   │   │   ├── resumes.ts            # Resume queries
│   │   │   ├── roasts.ts             # Roast queries
│   │   │   └── payments.ts           # Payment queries
│   │   └── migrations/               # Prisma migrations
│   │
│   ├── services/                     # Service Layer (Business Logic)
│   │   ├── roast.service.ts          # Roast generation orchestration
│   │   ├── resume.service.ts         # Resume upload & management
│   │   ├── payment.service.ts        # Payment processing
│   │   ├── user.service.ts           # User management
│   │   ├── share.service.ts          # Share URL & image generation
│   │   └── email.service.ts          # Email sending
│   │
│   ├── trpc/                         # tRPC Configuration
│   │   ├── client.ts                 # tRPC client
│   │   ├── server.ts                 # tRPC server setup
│   │   ├── context.ts                # Request context
│   │   ├── middleware.ts             # Auth & rate limit middleware
│   │   └── routers/
│   │       ├── index.ts              # Root router
│   │       ├── auth.router.ts        # Auth procedures
│   │       ├── roast.router.ts       # Roast procedures
│   │       ├── resume.router.ts      # Resume procedures
│   │       ├── payment.router.ts     # Payment procedures
│   │       └── admin.router.ts       # Admin procedures
│   │
│   ├── auth/                         # Authentication
│   │   ├── config.ts                 # NextAuth configuration
│   │   ├── providers.ts              # OAuth providers setup
│   │   └── callbacks.ts             # Auth callbacks
│   │
│   ├── storage/                      # File Storage
│   │   ├── s3-client.ts              # S3/R2 client
│   │   ├── upload.ts                 # Upload helpers
│   │   └── presigned.ts              # Presigned URL generation
│   │
│   ├── parsers/                      # File Parsers
│   │   ├── pdf-parser.ts             # PDF text extraction
│   │   ├── docx-parser.ts            # DOCX text extraction
│   │   └── text-cleaner.ts           # Text normalization
│   │
│   ├── utils/                        # Utilities
│   │   ├── validators.ts             # Zod validation schemas
│   │   ├── errors.ts                 # Custom error classes
│   │   ├── helpers.ts                # General helpers
│   │   ├── constants.ts              # App constants
│   │   ├── rate-limiter.ts           # Rate limiting logic
│   │   └── logger.ts                 # Structured logging
│   │
│   └── config/                       # Configuration
│       ├── env.ts                    # Environment variable validation
│       ├── site.ts                   # Site metadata
│       └── features.ts              # Feature flags
│
├── hooks/                            # Custom React Hooks
│   ├── useRoast.ts                   # Roast generation hook
│   ├── useUpload.ts                  # File upload hook
│   ├── useSubscription.ts            # Subscription status hook
│   ├── useDebounce.ts                # Debounce hook
│   ├── useMediaQuery.ts              # Responsive hook
│   └── useClipboard.ts              # Copy to clipboard hook
│
├── stores/                           # State Management (Zustand)
│   ├── app-store.ts                  # Global app state
│   ├── upload-store.ts               # Upload state
│   └── roast-store.ts               # Current roast state
│
├── types/                            # TypeScript Types
│   ├── roast.ts                      # Roast types
│   ├── resume.ts                     # Resume types
│   ├── user.ts                       # User types
│   ├── payment.ts                    # Payment types
│   ├── api.ts                        # API response types
│   └── global.d.ts                   # Global type declarations
│
└── styles/                           # Styles
    ├── globals.css                   # Global styles (Tailwind)
    └── animations.css                # Custom animations
```

---

## 3. Key File Responsibilities

### Critical Files Explanation

| File | Responsibility | Lines (Est.) |
|------|---------------|--------------|
| `lib/ai/roast-engine.ts` | Orchestrates the entire AI roast pipeline | 200–300 |
| `lib/services/roast.service.ts` | Business logic for creating/managing roasts | 150–250 |
| `lib/trpc/routers/roast.router.ts` | API endpoints for roast operations | 100–150 |
| `components/roast/RoastDisplay.tsx` | Renders streaming AI text with animations | 150–200 |
| `components/forms/ResumeUploader.tsx` | Drag & drop upload with validation | 100–150 |
| `app/(app)/roast/[id]/page.tsx` | Roast results page (composition) | 80–120 |
| `lib/auth/config.ts` | NextAuth configuration with all providers | 80–120 |
| `app/api/webhooks/stripe/route.ts` | Stripe webhook handler | 100–150 |
| `lib/config/env.ts` | Zod-validated environment variables | 60–80 |

---

## 4. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Files** | kebab-case | `roast-engine.ts` |
| **Components** | PascalCase | `RoastDisplay.tsx` |
| **Hooks** | camelCase with `use` prefix | `useRoast.ts` |
| **Types/Interfaces** | PascalCase | `RoastResult`, `ResumeData` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| **Functions** | camelCase | `generateRoast()` |
| **CSS Classes** | Tailwind utility classes | `className="flex items-center"` |
| **Environment Vars** | SCREAMING_SNAKE_CASE | `OPENAI_API_KEY` |
| **Database tables** | snake_case (plural) | `roasts`, `users` |
| **Database columns** | snake_case | `created_at`, `user_id` |

---

## 5. Import Order Convention

```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party library imports
import { z } from 'zod';
import { motion } from 'framer-motion';

// 3. Internal lib imports
import { generateRoast } from '@/lib/ai/roast-engine';
import { prisma } from '@/lib/db/prisma';

// 4. Component imports
import { Button } from '@/components/ui/button';
import { RoastScore } from '@/components/roast/RoastScore';

// 5. Hook imports
import { useRoast } from '@/hooks/useRoast';

// 6. Type imports
import type { RoastResult } from '@/types/roast';

// 7. Constant/config imports
import { MAX_FILE_SIZE } from '@/lib/utils/constants';
```

---

*Document Version: 1.0*
*Last Updated: 2026-03-02*
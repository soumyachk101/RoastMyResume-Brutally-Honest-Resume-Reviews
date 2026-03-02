# 📂 RoastMyResume.com — Code Structure & Architecture

## 1. Monorepo Structure (Turborepo)

```
roast-my-resume/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, test, type-check on PR
│   │   ├── deploy-preview.yml        # Deploy preview on PR
│   │   ├── deploy-production.yml     # Deploy to production on main
│   │   └── cron-cleanup.yml          # Scheduled resume file cleanup
│   ├── CODEOWNERS
│   └── pull_request_template.md
│
├── apps/
│   └── web/                          # Next.js 14 Application
│       ├── app/                      # App Router
│       │   ├── (marketing)/          # Public marketing pages
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── pricing/
│       │   │   │   └── page.tsx
│       │   │   ├── about/
│       │   │   │   └── page.tsx
│       │   │   ├── blog/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [slug]/page.tsx
│       │   │   └── layout.tsx        # Marketing layout
│       │   │
│       │   ├── (app)/                # Authenticated app pages
│       │   │   ├── upload/
│       │   │   │   └── page.tsx      # Resume upload page
│       │   │   ├── roast/
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx  # Roast results page
│       │   │   ├── dashboard/
│       │   │   │   └── page.tsx      # User dashboard
│       │   │   ├── history/
│       │   │   │   └── page.tsx      # Roast history
│       │   │   ├── settings/
│       │   │   │   └── page.tsx      # User settings
│       │   │   └── layout.tsx        # App layout (sidebar, nav)
│       │   │
│       │   ├── (auth)/               # Auth pages
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   ├── signup/
│       │   │   │   └── page.tsx
│       │   │   ├── forgot-password/
│       │   │   │   └── page.tsx
│       │   │   └── layout.tsx        # Auth layout (centered card)
│       │   │
│       │   ├── share/
│       │   │   └── [token]/
│       │   │       └── page.tsx      # Public shareable roast page
│       │   │
│       │   ├── api/
│       │   │   ├── auth/
│       │   │   │   └── [...nextauth]/route.ts
│       │   │   ├── trpc/
│       │   │   │   └── [trpc]/route.ts
│       │   │   ├── resume/
│       │   │   │   └── upload/route.ts
│       │   │   ├── roast/
│       │   │   │   ├── generate/route.ts
│       │   │   │   └── [id]/
│       │   │   │       ├── route.ts
│       │   │   │       └── status/route.ts
│       │   │   ├── share/
│       │   │   │   └── [id]/
│       │   │   │       ├── route.ts
│       │   │   │       └── image/route.ts
│       │   │   ├── stripe/
│       │   │   │   ├── checkout/route.ts
│       │   │   │   ├── webhook/route.ts
│       │   │   │   └── portal/route.ts
│       │   │   └── cron/
│       │   │       └── cleanup/route.ts  # Resume file cleanup
│       │   │
│       │   ├── layout.tsx            # Root layout
│       │   ├── globals.css           # Global styles
│       │   ├── not-found.tsx         # 404 page
│       │   └── error.tsx             # Error boundary
│       │
│       ├── components/
│       │   ├── ui/                   # shadcn/ui components
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── input.tsx
│       │   │   ├── progress.tsx
│       │   │   ├── toast.tsx
│       │   │   └── ...
│       │   │
│       │   ├── layout/               # Layout components
│       │   │   ├── header.tsx
│       │   │   ├── footer.tsx
│       │   │   ├── sidebar.tsx
│       │   │   ├── mobile-nav.tsx
│       │   │   └── theme-toggle.tsx
│       │   │
│       │   ├── upload/               # Upload feature components
│       │   │   ├── dropzone.tsx
│       │   │   ├── file-preview.tsx
│       │   │   ├── mode-selector.tsx
│       │   │   ├── industry-selector.tsx
│       │   │   └── upload-progress.tsx
│       │   │
│       │   ├── roast/                # Roast feature components
│       │   │   ├── score-gauge.tsx
│       │   │   ├── score-animation.tsx
│       │   │   ├── section-card.tsx
│       │   │   ├── section-list.tsx
│       │   │   ├── top-issues.tsx
│       │   │   ├── roast-summary.tsx
│       │   │   ├── typewriter-text.tsx
│       │   │   └── loading-skeleton.tsx
│       │   │
│       │   ├── share/                # Sharing components
│       │   │   ├── share-card.tsx
│       │   │   ├── share-buttons.tsx
│       │   │   ├── og-image-template.tsx
│       │   │   └── copy-link-button.tsx
│       │   │
│       │   ├── dashboard/            # Dashboard components
│       │   │   ├── stats-cards.tsx
│       │   │   ├── recent-roasts.tsx
│       │   │   ├── score-chart.tsx
│       │   │   └── quota-indicator.tsx
│       │   │
│       │   ├── payment/              # Payment components
│       │   │   ├── pricing-card.tsx
│       │   │   ├── pricing-table.tsx
│       │   │   ├── checkout-button.tsx
│       │   │   └── subscription-badge.tsx
│       │   │
│       │   └── common/               # Shared components
│       │       ├── logo.tsx
│       │       ├── avatar.tsx
│       │       ├── error-boundary.tsx
│       │       ├── loading-spinner.tsx
│       │       ├── empty-state.tsx
│       │       └── seo-head.tsx
│       │
│       ├── hooks/                    # Custom React hooks
│       │   ├── use-auth.ts
│       │   ├── use-roast.ts
│       │   ├── use-upload.ts
│       │   ├── use-subscription.ts
│       │   ├── use-polling.ts
│       │   └── use-share.ts
│       │
│       ├── stores/                   # Zustand stores
│       │   ├── upload-store.ts
│       │   ├── roast-store.ts
│       │   └── user-store.ts
│       │
│       ├── styles/                   # Additional styles
│       │   └── animations.css
│       │
│       ├── public/
│       │   ├── images/
│       │   ├── fonts/
│       │   ├── favicon.ico
│       │   ├── robots.txt
│       │   └── sitemap.xml
│       │
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── api/                          # tRPC API layer
│   │   ├── src/
│   │   │   ├── root.ts              # Root router
│   │   │   ├── trpc.ts              # tRPC initialization
│   │   │   ├── context.ts           # Request context
│   │   │   └── routers/
│   │   │       ├── auth.router.ts
│   │   │       ├── roast.router.ts
│   │   │       ├── user.router.ts
│   │   │       ├── payment.router.ts
│   │   │       └── share.router.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── db/                           # Database layer (Prisma)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── client.ts            # Prisma client singleton
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ai/                           # AI service layer
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── providers/
│   │   │   │   ├── openai.ts
│   │   │   │   ├── anthropic.ts
│   │   │   │   └── base.ts          # Abstract provider
│   │   │   ├── prompts/
│   │   │   │   ├── roast-mode.ts
│   │   │   │   ├── nice-mode.ts
│   │   │   │   ├── industry-modifiers.ts
│   │   │   │   ├── safety-check.ts
│   │   │   │   └── prompt-builder.ts
│   │   │   ├── parsers/
│   │   │   │   ├── response-parser.ts
│   │   │   │   └── score-calculator.ts
│   │   │   ├── circuit-breaker.ts
│   │   │   └── rate-limiter.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── resume-parser/                # Resume parsing library
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── parsers/
│   │   │   │   ├── pdf-parser.ts
│   │   │   │   ├── docx-parser.ts
│   │   │   │   ├── txt-parser.ts
│   │   │   │   └── ocr-parser.ts
│   │   │   ├── sanitizer.ts         # Text cleaning
│   │   │   └── validator.ts         # Content validation
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── queue/                        # Job queue (BullMQ)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── queues/
│   │   │   │   └── roast-queue.ts
│   │   │   ├── workers/
│   │   │   │   └── roast-worker.ts
│   │   │   └── types.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── storage/                      # File storage (R2/S3)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── r2-client.ts
│   │   │   ├── upload.ts
│   │   │   ├── download.ts
│   │   │   └── cleanup.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── email/                        # Email service
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── resend-client.ts
│   │   │   └── templates/
│   │   │       ├── welcome.tsx
│   │   │       ├── roast-complete.tsx
│   │   │       ├── password-reset.tsx
│   │   │       └── subscription-confirm.tsx
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared/                       # Shared utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── roast.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── payment.ts
│   │   │   │   └── api.ts
│   │   │   ├── schemas/              # Zod schemas
│   │   │   │   ├── roast.schema.ts
│   │   │   │   ├── user.schema.ts
│   │   │   │   ├── upload.schema.ts
│   │   │   │   └── payment.schema.ts
│   │   │   ├── constants.ts
│   │   │   ├── errors.ts
│   │   │   └── utils.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── config/                       # Shared configs
│       ├── eslint/
│       │   └── index.js
│       ├── typescript/
│       │   └── base.json
│       └── tailwind/
│           └── preset.js
│
├── scripts/
│   ├── seed-db.ts                    # Database seeding
│   ├── migrate-db.ts                 # Run migrations
│   ├── cleanup-resumes.ts            # Manual resume cleanup
│   └── generate-test-data.ts         # Generate test fixtures
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml            # Local dev (Postgres, Redis)
│   └── docker-compose.test.yml       # Test environment
│
├── docs/                             # Documentation (these files!)
│   ├── 01_PRD.md
│   ├── 02_TRD.md
│   ├── 03_SYSTEM_DESIGN.md
│   ├── 04_AI_INSTRUCTIONS_AND_MASTER_PROMPT.md
│   ├── 05_SRS.md
│   ├── 06_CODE_STRUCTURE.md
│   ├── 07_BACKEND_ARCHITECTURE.md
│   ├── 08_TESTING_AND_ERROR_HANDLING.md
│   ├── 09_DEPLOYMENT_AND_DEVOPS.md
│   └── 10_API_REFERENCE.md
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspace config
├── .env.example                      # Environment template
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── LICENSE
└── README.md
```

---

## 2. Dependency Graph

```
                    ┌───────────────────┐
                    │    apps/web        │
                    │  (Next.js App)     │
                    └─┬───┬───┬───┬───┬─┘
                      │   │   │   │   │
            ┌─────────��   │   │   │   └──────────┐
            │             │   │   │              │
            ▼             ▼   │   ▼              ▼
     ┌──────────┐  ┌─────────┐│ ┌────────┐ ┌──────────┐
     │ packages/ │  │packages/││ │packages/│ │ packages/│
     │   api     │  │  ai     ││ │  email  │ │  storage │
     └────┬──────┘  └────┬────┘│ └────┬───┘ └────┬─────┘
          │               │     │      │          │
          │    ┌──────────┘     │      │          │
          │    │                │      │          │
          ▼    ▼                ▼      ▼          ▼
     ┌──────────────┐   ┌──────────┐  ┌──────────────┐
     │  packages/   │   │packages/ │  │  packages/   │
     │    db        │   │  queue   │  │   shared     │
     └──────┬───────┘   └────┬─────┘  └──────────────┘
            │                │                ▲
            │                │                │
            └────────────────┴────────────────┘
                    (all depend on shared)
```

---

## 3. Key Configuration Files

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "test:e2e": {
      "dependsOn": ["build"]
    }
  }
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```
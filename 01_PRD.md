# 📄 RoastMyResume.com — Product Requirements Document (PRD)

## 1. Executive Summary

**RoastMyResume.com** is a SaaS web application that provides brutally honest, AI-powered resume reviews with a comedic twist. Users upload their resume and receive a savage (but genuinely helpful) roast — complete with actionable suggestions, section-by-section scores, and shareable results.

The product offers two modes:
- 🔥 **Roast Mode (Gordon Ramsay Style):** Brutally funny, pulls no punches
- 😊 **Nice Mode:** Constructive and encouraging, still highly actionable

**Target Launch Date:** Q2 2026
**Target Users:** Job seekers, career changers, students, and professionals
**Revenue Model:** Freemium + Subscription (Stripe)

---

## 2. Problem Statement

- **82% of resumes** are rejected by ATS systems before a human ever sees them.
- Professional resume reviews cost **$100–$500** and take **3–7 days**.
- Most free resume tools give **generic, unhelpful feedback**.
- Job seekers are **emotionally attached** to their resumes and need a wake-up call.
- Resume feedback is **boring** — nobody shares it, nobody talks about it.

**Our Insight:** If you make resume feedback **entertaining**, people will:
1. Actually **read** it
2. Actually **act** on it
3. **Share** it on social media (free viral marketing)

---

## 3. Target Audience

| Segment | Description | Pain Point |
|---------|-------------|------------|
| **Fresh Graduates** | 18–25, first-time job seekers | No idea what makes a good resume |
| **Career Changers** | 25–40, switching industries | Don't know how to reposition experience |
| **Tech Professionals** | Engineers, designers, PMs | Resumes are too generic, not optimized |
| **Students** | College/university students | Need internship-ready resumes |
| **International Applicants** | Non-native English speakers | Formatting and language issues |

---

## 4. Product Vision & Goals

### Vision
> *"Make resume improvement so entertaining that people actually do it — and tell their friends."*

### Goals (6-Month)
| Goal | Metric | Target |
|------|--------|--------|
| User Acquisition | Monthly Active Users | 50,000 MAU |
| Engagement | Roasts Generated/Day | 3,000+ |
| Virality | Social Shares/Day | 500+ |
| Revenue | MRR | $25,000 |
| Retention | 30-Day Return Rate | 35% |
| Satisfaction | NPS Score | 60+ |

---

## 5. Feature Specification

### 5.1 Core Features (MVP — v1.0)

#### F1: Resume Upload & Parsing
- **Formats:** PDF, DOCX, TXT
- **Max Size:** 5MB
- **Parsing:** Extract text, identify sections (Summary, Experience, Skills, Education, Projects, Certifications)
- **ATS Check:** Validate ATS compatibility (no tables, images, weird fonts)
- **Languages:** English only (v1)

#### F2: AI Roast Generation
- **Two Modes:** Roast (Gordon Ramsay) and Nice (Supportive Coach)
- **Industry Context:** Tech, Finance, Healthcare, General
- **Output:**
  - Overall score (0–100)
  - Roast title (viral-worthy one-liner)
  - Executive summary roast
  - Section-by-section breakdown (score + roast + suggestions)
  - Top strengths (2–3)
  - Critical fixes (2–3)
- **Processing Time:** < 10 seconds

#### F3: Interactive Results Dashboard
- Animated score reveal (counter animation)
- Section cards with expand/collapse
- Color-coded severity (red/yellow/green)
- "Before vs After" suggestion previews
- Confetti animation for scores > 80
- Sad trombone sound for scores < 30 (optional, toggle)

#### F4: Social Sharing
- Generate shareable OG image with score + roast title
- Share to Twitter/X, LinkedIn, Reddit
- Public share link (read-only, 30-day expiry)
- "I survived RoastMyResume" badge

#### F5: User Authentication & Accounts
- Sign up with Email/Password
- OAuth: Google, GitHub, LinkedIn
- Email verification
- Password reset flow
- Session management (NextAuth.js)

#### F6: Roast History
- View all past roasts
- Compare scores over time (progress chart)
- Re-roast same resume (track improvement)
- Delete roasts

#### F7: Pricing & Billing
| Feature | Free | Pro ($9.99/mo) | Team ($29.99/mo) |
|---------|------|----------------|-------------------|
| Roasts/day | 3 | 50 | 200 |
| Roast Mode | ✅ | ✅ | ✅ |
| Nice Mode | ✅ | ✅ | ✅ |
| Gordon Ramsay Mode | ❌ | ✅ | ✅ |
| Detailed Reports | ❌ | ✅ | ✅ |
| ATS Deep Scan | ❌ | ✅ | ✅ |
| Priority Processing | ❌ | ✅ | ✅ |
| Team Dashboard | ❌ | ❌ | ✅ |
| Bulk Upload | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |

---

### 5.2 Phase 2 Features (v1.5)

| Feature | Description |
|---------|-------------|
| **Resume Builder** | Fix issues directly in-app with AI suggestions |
| **LinkedIn Roast** | Paste LinkedIn URL, roast the profile |
| **Cover Letter Roast** | Upload cover letter for roast |
| **Job Match Score** | Paste job description → get match % |
| **Interview Prep** | AI-generated interview questions based on resume |
| **Chrome Extension** | Roast resumes directly on LinkedIn/Indeed |
| **Multi-language** | Support for Spanish, French, German, Hindi |

### 5.3 Phase 3 Features (v2.0)

| Feature | Description |
|---------|-------------|
| **Enterprise Dashboard** | HR teams review candidate resumes in bulk |
| **University Partnerships** | White-label for career services |
| **Resume Tournaments** | Users vote on anonymized resumes (gamification) |
| **AI Career Coach** | Chat-based career advice |
| **Mobile App** | iOS + Android native apps |

---

## 6. User Flows

### 6.1 Primary Flow: Upload → Roast → Share

```
Landing Page → [Upload Resume] → Select Mode (Roast/Nice)
  → Select Industry → [Submit]
  → Loading Animation (8-10 sec)
  → Results Dashboard (animated score reveal)
  → [Share to Twitter] / [Download Report] / [Try Again]
```

### 6.2 Authentication Flow

```
Landing Page → [Get Started] → Sign Up (Email or OAuth)
  → Email Verification → Dashboard
  → [Upload First Resume]
```

### 6.3 Upgrade Flow

```
Free User → Hits daily limit (3 roasts)
  → [Upgrade Modal with pricing]
  → Select Plan → Stripe Checkout
  → Return to Dashboard (Pro badge)
```

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Page Load (LCP)** | < 1.5 seconds |
| **Roast Generation** | < 10 seconds (p95) |
| **Uptime** | 99.9% |
| **Concurrent Users** | 10,000+ |
| **Data Retention** | 90 days (free), unlimited (paid) |
| **Security** | SOC 2 Type I compliant practices |
| **Accessibility** | WCAG 2.1 AA |
| **Browser Support** | Chrome, Firefox, Safari, Edge (last 2 versions) |
| **Mobile** | Fully responsive (mobile-first) |

---

## 8. Success Metrics & KPIs

| Category | Metric | Target (Month 3) | Target (Month 6) |
|----------|--------|-------------------|-------------------|
| **Growth** | Total Users | 20,000 | 80,000 |
| **Engagement** | Daily Roasts | 1,000 | 5,000 |
| **Virality** | Viral Coefficient | 1.2 | 1.5 |
| **Revenue** | MRR | $5,000 | $25,000 |
| **Conversion** | Free → Pro | 4% | 7% |
| **Retention** | D30 Retention | 25% | 35% |
| **Satisfaction** | NPS | 50 | 65 |

---

## 9. Competitive Analysis

| Competitor | Price | Speed | Fun Factor | Actionable |
|-----------|-------|-------|------------|------------|
| **TopResume** | $149+ | 7 days | ❌ | ✅ |
| **Zety** | $2.99/mo | Instant | ❌ | ⚠️ Generic |
| **Resume Worded** | $49/mo | Instant | ❌ | ✅ |
| **Jobscan** | $49.95/mo | Instant | ❌ | ⚠️ ATS only |
| **RoastMyResume** | **$0–$9.99/mo** | **< 10 sec** | **🔥🔥🔥** | **✅✅** |

**Our Moat:** Nobody else combines entertainment + actionable feedback + virality.

---

## 10. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI generates offensive content | High | Medium | Strict content guardrails, profanity filter, bias review |
| OpenAI API outage | High | Low | Fallback to Anthropic Claude, queue system |
| Low conversion rate | Medium | Medium | A/B test pricing, add free value, improve onboarding |
| Viral negative press | High | Low | Clear disclaimer: "For entertainment & education" |
| Resume data privacy concerns | High | Medium | SOC 2 practices, auto-delete, encryption at rest |
| Competitor copies concept | Medium | High | Move fast, build brand, community moat |

---

## 11. Legal & Compliance

- **Privacy Policy:** GDPR and CCPA compliant
- **Data Processing:** Resumes processed in-memory, stored encrypted, auto-deleted after 90 days (free)
- **AI Disclaimer:** "Feedback is AI-generated for entertainment and educational purposes. Not professional career advice."
- **Terms of Service:** Users retain ownership of uploaded content
- **Cookie Consent:** Banner with opt-in for analytics
- **Age Requirement:** 16+ (parental consent for under 18)
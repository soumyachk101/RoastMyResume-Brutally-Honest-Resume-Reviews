# 📜 Statement of Requirements (SOR)
## RoastMyResume.com

---

## 1. Business Requirements

### BR-001: Market Entry
- **Requirement:** Launch a functional MVP within 4 weeks of development start
- **Rationale:** First-mover advantage in AI resume roasting niche
- **Success Criteria:** Publicly accessible application with core features

### BR-002: Revenue Generation
- **Requirement:** Implement monetization within 8 weeks of launch
- **Rationale:** Sustainable business model required for continued development
- **Success Criteria:** $10K MRR within 3 months of launch

### BR-003: Viral Growth
- **Requirement:** Built-in social sharing mechanics that drive organic user acquisition
- **Rationale:** Reduce CAC (Customer Acquisition Cost) through virality
- **Success Criteria:** 20%+ of users share their roast results; K-factor > 1.2

### BR-004: Data Privacy Compliance
- **Requirement:** GDPR and CCPA compliance from day one
- **Rationale:** Legal obligation; resumes contain PII
- **Success Criteria:** Pass external privacy audit

---

## 2. Functional Requirements

### 2.1 User Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-101 | System shall allow user registration via email/password | P0 | Planned |
| FR-102 | System shall support Google OAuth login | P0 | Planned |
| FR-103 | System shall support GitHub OAuth login | P1 | Planned |
| FR-104 | System shall support magic link (passwordless) auth | P1 | Planned |
| FR-105 | System shall send email verification on registration | P0 | Planned |
| FR-106 | System shall support password reset via email | P0 | Planned |
| FR-107 | System shall allow profile updates (name, avatar) | P2 | Planned |
| FR-108 | System shall allow account deletion with data purge | P0 | Planned |
| FR-109 | System shall allow anonymous usage (1 free roast, no login) | P0 | Planned |

### 2.2 Resume Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-201 | System shall accept PDF uploads up to 10MB | P0 | Planned |
| FR-202 | System shall accept DOCX uploads up to 5MB | P0 | Planned |
| FR-203 | System shall accept plain text paste input | P0 | Planned |
| FR-204 | System shall validate file type by magic bytes (not extension) | P0 | Planned |
| FR-205 | System shall extract text from PDF with 99%+ accuracy | P0 | Planned |
| FR-206 | System shall extract text from DOCX preserving structure | P0 | Planned |
| FR-207 | System shall display upload progress indicator | P1 | Planned |
| FR-208 | System shall store resumes encrypted at rest (AES-256) | P0 | Planned |
| FR-209 | System shall auto-delete free-tier resumes after 30 days | P0 | Planned |
| FR-210 | System shall allow manual resume deletion by user | P0 | Planned |
| FR-211 | System shall scan uploads for malware/viruses | P1 | Planned |
| FR-212 | System shall reject files that are not valid resumes | P2 | Planned |

### 2.3 Roast Engine

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-301 | System shall offer "Gordon Ramsay" (roast) mode | P0 | Planned |
| FR-302 | System shall offer "Nice" (constructive) mode | P0 | Planned |
| FR-303 | System shall generate roast/review in < 10 seconds | P0 | Planned |
| FR-304 | System shall stream AI response in real-time to client | P0 | Planned |
| FR-305 | System shall calculate overall score (0-100) | P0 | Planned |
| FR-306 | System shall calculate 6 dimension scores | P0 | Planned |
| FR-307 | System shall apply content safety filter to all outputs | P0 | Planned |
| FR-308 | System shall save roast results to database | P0 | Planned |
| FR-309 | System shall allow re-roasting same resume in different mode | P1 | Planned |
| FR-310 | System shall handle AI API failures gracefully with retry | P0 | Planned |
| FR-311 | System shall cache identical resume roasts for 1 hour | P1 | Planned |

### 2.4 Social Sharing

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-401 | System shall generate unique shareable URL per roast | P0 | Planned |
| FR-402 | System shall generate OG image with score + best roast line | P0 | Planned |
| FR-403 | System shall support one-click share to Twitter/X | P0 | Planned |
| FR-404 | System shall support one-click share to LinkedIn | P1 | Planned |
| FR-405 | System shall support one-click share to Reddit | P2 | Planned |
| FR-406 | System shall track referral sources from shared links | P1 | Planned |
| FR-407 | Share page shall be public (no auth required to view) | P0 | Planned |

### 2.5 Payments

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-501 | System shall integrate Stripe for payment processing | P0 | Planned |
| FR-502 | System shall support one-time purchase (Roast Pass) | P0 | Planned |
| FR-503 | System shall support monthly subscriptions | P0 | Planned |
| FR-504 | System shall support annual subscriptions | P1 | Planned |
| FR-505 | System shall handle Stripe webhooks for payment events | P0 | Planned |
| FR-506 | System shall upgrade/downgrade user tier on payment | P0 | Planned |
| FR-507 | System shall provide Stripe Customer Portal access | P1 | Planned |
| FR-508 | System shall handle failed payments gracefully | P0 | Planned |
| FR-509 | System shall send receipt emails after payment | P1 | Planned |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-101 | Page load time (LCP) | < 2.5 seconds |
| NFR-102 | API response time (p95) | < 500ms |
| NFR-103 | AI roast generation time | < 10 seconds |
| NFR-104 | File upload time (5MB PDF) | < 3 seconds |
| NFR-105 | Time to First Byte (TTFB) | < 200ms |
| NFR-106 | Concurrent user support | 10,000+ |

### 3.2 Security

| ID | Requirement |
|----|-------------|
| NFR-201 | All traffic over HTTPS (TLS 1.3) |
| NFR-202 | Passwords hashed with bcrypt (cost 12) |
| NFR-203 | SQL injection prevention (ORM + parameterized) |
| NFR-204 | XSS prevention (CSP headers + input sanitization) |
| NFR-205 | CSRF protection on all mutations |
| NFR-206 | Rate limiting on all public endpoints |
| NFR-207 | File upload malware scanning |
| NFR-208 | Dependency vulnerability scanning (automated) |
| NFR-209 | PII encryption at rest |
| NFR-210 | Presigned URLs for file access (expiring) |

### 3.3 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-301 | System uptime | 99.9% |
| NFR-302 | Database backup frequency | Daily |
| NFR-303 | Recovery Point Objective (RPO) | 1 hour |
| NFR-304 | Recovery Time Objective (RTO) | 2 hours |
| NFR-305 | AI service fallback | Secondary model available |

### 3.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-401 | WCAG 2.1 AA accessibility compliance |
| NFR-402 | Mobile-responsive (320px – 2560px) |
| NFR-403 | Support latest 2 versions of major browsers |
| NFR-404 | Keyboard navigable |
| NFR-405 | Screen reader compatible |

---

## 4. Constraints

| Constraint | Description |
|------------|-------------|
| **Budget** | MVP development budget: $0–$500 (use free tiers) |
| **Timeline** | MVP must ship within 4 weeks |
| **Team** | Solo developer (full-stack) |
| **AI Cost** | Per-roast AI cost must remain under $0.10 |
| **Legal** | Must not store resumes longer than necessary |
| **Platform** | Web-first (no native mobile for MVP) |

---

## 5. Assumptions

1. Users are comfortable uploading their resumes to a web application
2. OpenAI API will maintain current pricing and availability
3. Stripe will remain the primary payment processor
4. The viral/humorous angle will drive organic growth
5. Users prefer instant AI feedback over human review (for this price point)

---

## 6. Dependencies

| Dependency | Type | Risk Level | Mitigation |
|------------|------|------------|------------|
| OpenAI GPT-4o API | External | High | Fallback to Claude/Gemini |
| Stripe API | External | Low | Well-established, reliable |
| Vercel Platform | Infrastructure | Low | Can migrate to AWS/Railway |
| Supabase | Infrastructure | Medium | Standard Postgres, portable |
| Cloudflare R2 | Infrastructure | Low | S3-compatible, easy migration |

---

*Document Version: 1.0*
*Last Updated: 2026-03-02*
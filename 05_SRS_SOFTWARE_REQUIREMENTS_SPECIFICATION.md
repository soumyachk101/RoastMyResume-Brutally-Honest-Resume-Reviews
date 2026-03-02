# 📋 RoastMyResume.com — Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This SRS defines the complete functional and non-functional requirements for RoastMyResume.com, an AI-powered resume review platform.

### 1.2 Scope
The system includes a web application (frontend + backend), AI integration layer, payment processing, file management, and analytics.

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|-----------|
| Roast | An AI-generated humorous critique of a resume |
| Nice Review | An AI-generated constructive, kind critique |
| ATS | Applicant Tracking System |
| MAU | Monthly Active Users |
| LLM | Large Language Model |
| OG Image | Open Graph image for social media previews |

---

## 2. Functional Requirements

### FR-001: User Registration & Authentication

| ID | Requirement | Priority |
|----|------------|----------|
| FR-001.1 | System SHALL allow users to register with email and password | Must |
| FR-001.2 | System SHALL allow users to register/login via Google OAuth 2.0 | Must |
| FR-001.3 | System SHALL send email verification on registration | Must |
| FR-001.4 | System SHALL support password reset via email | Must |
| FR-001.5 | System SHALL maintain user sessions using HTTP-only secure cookies | Must |
| FR-001.6 | System SHALL enforce minimum password: 8 chars, 1 uppercase, 1 number | Must |
| FR-001.7 | System SHALL lock accounts after 5 failed login attempts for 15 minutes | Should |

### FR-002: Resume Upload

| ID | Requirement | Priority |
|----|------------|----------|
| FR-002.1 | System SHALL accept PDF, DOCX, and TXT file uploads | Must |
| FR-002.2 | System SHALL reject files larger than 5MB | Must |
| FR-002.3 | System SHALL support drag-and-drop file upload | Must |
| FR-002.4 | System SHALL display upload progress indicator | Must |
| FR-002.5 | System SHALL validate file type by MIME type (not just extension) | Must |
| FR-002.6 | System SHALL extract text content from uploaded files | Must |
| FR-002.7 | System SHALL use OCR as fallback for scanned PDFs | Should |
| FR-002.8 | System SHALL reject files with < 50 characters of extractable text | Must |
| FR-002.9 | System SHALL scan uploaded files for malware | Should |

### FR-003: Roast Generation

| ID | Requirement | Priority |
|----|------------|----------|
| FR-003.1 | System SHALL offer "Roast Mode" (brutal humor) | Must |
| FR-003.2 | System SHALL offer "Nice Mode" (constructive) | Must |
| FR-003.3 | System SHALL generate a score from 0-100 | Must |
| FR-003.4 | System SHALL provide section-by-section feedback | Must |
| FR-003.5 | System SHALL provide 3+ actionable suggestions per section | Must |
| FR-003.6 | System SHALL identify top 5 issues | Must |
| FR-003.7 | System SHALL complete generation within 10 seconds (P95) | Must |
| FR-003.8 | System SHALL display real-time progress during generation | Should |
| FR-003.9 | System SHALL support industry-specific evaluation | Should |
| FR-003.10 | System SHALL run content safety check on all AI output | Must |

### FR-004: Results Display

| ID | Requirement | Priority |
|----|------------|----------|
| FR-004.1 | System SHALL display overall score with visual gauge | Must |
| FR-004.2 | System SHALL display section scores with progress bars | Must |
| FR-004.3 | System SHALL animate score reveal (dramatic effect) | Should |
| FR-004.4 | System SHALL display roast text with typewriter animation | Should |
| FR-004.5 | System SHALL allow expanding/collapsing individual sections | Must |
| FR-004.6 | System SHALL highlight key issues with color coding | Must |

### FR-005: Social Sharing

| ID | Requirement | Priority |
|----|------------|----------|
| FR-005.1 | System SHALL generate a shareable roast card image | Must |
| FR-005.2 | System SHALL provide one-click sharing to Twitter/X | Must |
| FR-005.3 | System SHALL provide one-click sharing to LinkedIn | Must |
| FR-005.4 | System SHALL provide a copyable share link | Must |
| FR-005.5 | System SHALL generate unique OG images for each roast | Must |
| FR-005.6 | System SHALL track share events per platform | Should |
| FR-005.7 | Share pages SHALL be accessible without login | Must |

### FR-006: Payment & Subscription

| ID | Requirement | Priority |
|----|------------|----------|
| FR-006.1 | System SHALL integrate Stripe for payment processing | Must |
| FR-006.2 | System SHALL offer monthly subscription ($4.99/mo) | Must |
| FR-006.3 | System SHALL offer annual subscription ($39.99/yr) | Must |
| FR-006.4 | System SHALL offer pay-per-roast ($2.99/roast) | Must |
| FR-006.5 | System SHALL handle subscription upgrades/downgrades | Must |
| FR-006.6 | System SHALL handle cancellation with end-of-period access | Must |
| FR-006.7 | System SHALL provide Stripe Customer Portal access | Must |
| FR-006.8 | System SHALL process Stripe webhooks reliably | Must |
| FR-006.9 | System SHALL display current subscription status | Must |

### FR-007: Rate Limiting & Quotas

| ID | Requirement | Priority |
|----|------------|----------|
| FR-007.1 | Free users SHALL be limited to 1 roast per 24-hour period | Must |
| FR-007.2 | System SHALL display remaining daily quota to free users | Must |
| FR-007.3 | System SHALL show upgrade prompt when quota is reached | Must |
| FR-007.4 | Pro users SHALL have unlimited roasts | Must |
| FR-007.5 | System SHALL enforce API rate limits per user tier | Must |

### FR-008: User Dashboard & History

| ID | Requirement | Priority |
|----|------------|----------|
| FR-008.1 | System SHALL display all past roasts in chronological order | Should |
| FR-008.2 | System SHALL allow users to view past roast details | Should |
| FR-008.3 | System SHALL allow users to delete past roasts | Should |
| FR-008.4 | System SHALL display score improvement trends | Could |
| FR-008.5 | System SHALL allow exporting roast report as PDF | Could |

### FR-009: Account Management

| ID | Requirement | Priority |
|----|------------|----------|
| FR-009.1 | System SHALL allow users to update name and email | Must |
| FR-009.2 | System SHALL allow users to change password | Must |
| FR-009.3 | System SHALL allow users to delete account and all data | Must |
| FR-009.4 | System SHALL allow users to export all their data (GDPR) | Must |
| FR-009.5 | System SHALL confirm account deletion with email verification | Must |

---

## 3. Non-Functional Requirements

### NFR-001: Performance

| ID | Requirement |
|----|------------|
| NFR-001.1 | Page load time (LCP) SHALL be < 2.5 seconds |
| NFR-001.2 | Time to Interactive SHALL be < 3.5 seconds |
| NFR-001.3 | API response time (non-AI) SHALL be < 200ms (P95) |
| NFR-001.4 | AI roast generation SHALL complete in < 10 seconds (P95) |
| NFR-001.5 | File upload SHALL complete in < 3 seconds for 5MB file |

### NFR-002: Scalability

| ID | Requirement |
|----|------------|
| NFR-002.1 | System SHALL handle 1,000 concurrent users |
| NFR-002.2 | System SHALL handle 10,000 roasts per day |
| NFR-002.3 | System SHALL auto-scale based on demand |

### NFR-003: Security

| ID | Requirement |
|----|------------|
| NFR-003.1 | All data in transit SHALL be encrypted with TLS 1.3 |
| NFR-003.2 | All stored files SHALL be encrypted with AES-256 |
| NFR-003.3 | Resume files SHALL be auto-deleted after 24 hours |
| NFR-003.4 | System SHALL pass OWASP Top 10 security audit |
| NFR-003.5 | System SHALL implement CSRF protection |
| NFR-003.6 | System SHALL implement Content Security Policy headers |

### NFR-004: Reliability

| ID | Requirement |
|----|------------|
| NFR-004.1 | System uptime SHALL be 99.9% (< 8.77 hours downtime/year) |
| NFR-004.2 | Database SHALL have automated daily backups |
| NFR-004.3 | System SHALL gracefully degrade when AI provider is unavailable |
| NFR-004.4 | Failed jobs SHALL be retried up to 3 times with exponential backoff |

### NFR-005: Compliance

| ID | Requirement |
|----|------------|
| NFR-005.1 | System SHALL comply with GDPR (data export, deletion) |
| NFR-005.2 | System SHALL comply with CCPA |
| NFR-005.3 | System SHALL display cookie consent banner |
| NFR-005.4 | System SHALL maintain a public privacy policy |
| NFR-005.5 | System SHALL maintain a public terms of service |
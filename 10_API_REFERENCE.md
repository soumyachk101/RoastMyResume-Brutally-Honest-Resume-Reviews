# 📡 RoastMyResume.com — API Reference

## Base URL
```
Production: https://roastmyresume.com/api
Staging:    https://staging.roastmyresume.com/api
```

## Authentication
All authenticated endpoints require a session cookie (set by NextAuth) or Bearer token.

```
Cookie: next-auth.session-token=<token>
```

---

## Endpoints

### 1. Authentication

#### POST /auth/signup
Create a new account with email and password.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "usr_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "tier": "free"
  },
  "message": "Account created. Please check your email to verify."
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid email or password too weak |
| 409 | `EMAIL_EXISTS` | Email already registered |

---

#### POST /auth/signin
Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "usr_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "tier": "pro"
  }
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 423 | `ACCOUNT_LOCKED` | Too many failed attempts |

---

#### POST /auth/signout
End the current session and clear the auth cookie.

**Response (200):**
```json
{
  "message": "Signed out successfully."
}
```

---

#### POST /auth/forgot-password
Request a password reset email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account with that email exists, a reset link has been sent."
}
```

---

#### POST /auth/reset-password
Reset password using a token from the reset email.

**Request:**
```json
{
  "token": "rst_token_abc123",
  "newPassword": "NewSecurePass456"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset successfully."
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_TOKEN` | Token is expired or invalid |
| 400 | `VALIDATION_ERROR` | New password too weak |

---

### 2. Resume Upload & Roast

#### POST /resume/upload 🔒
Upload a resume and start roast generation.

**Request (multipart/form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ | PDF, DOCX, or TXT (max 5MB) |
| `mode` | String | ✅ | `roast` or `nice` |
| `industry` | String | ❌ | `tech`, `finance`, `healthcare`, `general` (default: `general`) |

**Response (202 Accepted):**
```json
{
  "jobId": "rst_abc123def456",
  "status": "processing",
  "estimatedTimeSeconds": 8,
  "pollUrl": "/api/roast/rst_abc123def456/status"
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `UNSUPPORTED_FILE_TYPE` | File is not PDF, DOCX, or TXT |
| 401 | `UNAUTHORIZED` | Not authenticated |
| 413 | `FILE_TOO_LARGE` | File exceeds 5MB |
| 422 | `INSUFFICIENT_CONTENT` | Resume text too short (< 50 chars) |
| 422 | `PARSE_FAILURE` | Could not extract text from file |
| 429 | `QUOTA_EXCEEDED` | Daily free limit reached |

---

#### GET /roast/:id/status 🔒
Poll the status of a roast generation job.

**Response (200):**
```json
// Processing
{
  "id": "rst_abc123def456",
  "status": "processing",
  "progress": 65,
  "estimatedRemainingSeconds": 3
}

// Completed
{
  "id": "rst_abc123def456",
  "status": "completed",
  "resultUrl": "/api/roast/rst_abc123def456"
}

// Failed
{
  "id": "rst_abc123def456",
  "status": "failed",
  "error": "AI service temporarily unavailable. Please try again."
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | Not authenticated |
| 403 | `FORBIDDEN` | Roast belongs to another user |
| 404 | `NOT_FOUND` | Roast ID does not exist |

---

#### GET /roast/:id 🔒
Get the complete roast result.

**Response (200):**
```json
{
  "id": "rst_abc123def456",
  "mode": "roast",
  "industry": "tech",
  "status": "completed",
  "overallScore": 42,
  "roastTitle": "Did a ChatGPT Write This? Because It's Generic AF.",
  "summary": "I've reviewed resumes from fresh bootcamp grads with more personality than this. Your resume reads like a Wikipedia article about a hypothetical employee.",
  "sections": [
    {
      "name": "Professional Summary",
      "score": 25,
      "roast": "Your summary is so vague it could belong to literally anyone on Earth. 'Passionate professional seeking growth opportunities' — congratulations, you've described every employed human.",
      "suggestions": [
        "Start with: '[Job Title] with [X years] of experience in [specific skill], delivering [specific result]'",
        "Include a quantified achievement in your summary",
        "Mention the specific role/company you're targeting"
      ]
    },
    {
      "name": "Work Experience",
      "score": 45,
      "roast": "You 'managed projects' and 'collaborated with stakeholders.' Groundbreaking. That's not a resume bullet — that's breathing while employed.",
      "suggestions": [
        "Use the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'",
        "Add specific numbers: revenue generated, users impacted, time saved",
        "Replace 'responsible for' with action verbs: 'Led', 'Architected', 'Shipped'"
      ]
    },
    {
      "name": "Skills",
      "score": 55,
      "roast": "Your skills section looks like you right-clicked 'Select All' on a job posting. Microsoft Office? Really? It's 2026.",
      "suggestions": [
        "Remove generic skills everyone has (e.g., Microsoft Office, 'communication')",
        "Group skills by category: Languages, Frameworks, Tools, Cloud",
        "Add proficiency levels or years of experience for each skill"
      ]
    },
    {
      "name": "Education",
      "score": 60,
      "roast": "Your GPA is conspicuously absent. Either you're being modest or... you're not.",
      "suggestions": [
        "Include GPA if above 3.3",
        "List relevant coursework, projects, or honors",
        "Add graduation date — gaps raise eyebrows"
      ]
    },
    {
      "name": "Formatting & Presentation",
      "score": 35,
      "roast": "Three pages?! This isn't a memoir. Recruiters spend 6 seconds on your resume and you gave them a novel.",
      "suggestions": [
        "Keep it to one page (two max for 10+ years experience)",
        "Use consistent formatting: font size, bullet style, spacing",
        "Ensure ATS compatibility — avoid tables, images, and fancy layouts"
      ]
    }
  ],
  "topStrengths": [
    "Clear job title progression shows career growth",
    "Relevant technical skills listed"
  ],
  "criticalFixes": [
    "Quantify every bullet point with numbers/metrics",
    "Cut resume down to one page",
    "Replace vague summary with specific value proposition"
  ],
  "createdAt": "2026-03-02T14:30:00Z",
  "processingTimeMs": 7823
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | Not authenticated |
| 403 | `FORBIDDEN` | Roast belongs to another user |
| 404 | `NOT_FOUND` | Roast ID does not exist |
| 409 | `NOT_READY` | Roast is still processing |

---

#### GET /roast/:id/share 🔒
Generate a shareable public link for a roast result.

**Response (200):**
```json
{
  "shareUrl": "https://roastmyresume.com/shared/sh_xyz789",
  "expiresAt": "2026-04-02T14:30:00Z"
}
```

---

### 3. User Profile & History

#### GET /user/me 🔒
Get the authenticated user's profile.

**Response (200):**
```json
{
  "id": "usr_abc123",
  "name": "John Doe",
  "email": "john@example.com",
  "tier": "pro",
  "roastsUsedToday": 2,
  "roastsLimit": 50,
  "totalRoasts": 14,
  "joinedAt": "2026-01-15T09:00:00Z"
}
```

---

#### PATCH /user/me 🔒
Update the authenticated user's profile.

**Request:**
```json
{
  "name": "Johnny Doe",
  "email": "johnny@example.com"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "usr_abc123",
    "name": "Johnny Doe",
    "email": "johnny@example.com",
    "tier": "pro"
  },
  "message": "Profile updated successfully."
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid email format |
| 409 | `EMAIL_EXISTS` | New email is already in use |

---

#### GET /user/me/roasts 🔒
Get the authenticated user's roast history.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 10 | Results per page (max 50) |
| `mode` | String | — | Filter by `roast` or `nice` |
| `sort` | String | `desc` | Sort by date: `asc` or `desc` |

**Response (200):**
```json
{
  "roasts": [
    {
      "id": "rst_abc123def456",
      "mode": "roast",
      "industry": "tech",
      "overallScore": 42,
      "roastTitle": "Did a ChatGPT Write This? Because It's Generic AF.",
      "createdAt": "2026-03-02T14:30:00Z"
    },
    {
      "id": "rst_def789ghi012",
      "mode": "nice",
      "industry": "finance",
      "overallScore": 78,
      "roastTitle": "Not Bad! But Let's Make It Great.",
      "createdAt": "2026-02-28T10:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 14,
    "totalPages": 2
  }
}
```

---

#### DELETE /user/me/roasts/:id 🔒
Delete a specific roast from history.

**Response (200):**
```json
{
  "message": "Roast deleted successfully."
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 403 | `FORBIDDEN` | Roast belongs to another user |
| 404 | `NOT_FOUND` | Roast ID does not exist |

---

### 4. Billing & Subscription

#### GET /billing/subscription 🔒
Get the user's current subscription details.

**Response (200):**
```json
{
  "tier": "pro",
  "status": "active",
  "currentPeriodStart": "2026-02-02T00:00:00Z",
  "currentPeriodEnd": "2026-03-02T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "stripeCustomerId": "cus_xyz789",
  "plan": {
    "name": "Pro Monthly",
    "priceMonthly": 9.99,
    "roastsPerDay": 50,
    "features": ["gordon_ramsay_mode", "detailed_reports", "priority_processing"]
  }
}
```

---

#### POST /billing/checkout 🔒
Create a Stripe checkout session to upgrade to a paid plan.

**Request:**
```json
{
  "plan": "pro_monthly",
  "successUrl": "https://roastmyresume.com/dashboard?upgraded=true",
  "cancelUrl": "https://roastmyresume.com/pricing"
}
```

**Response (200):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_abc123...",
  "sessionId": "cs_live_abc123"
}
```

**Available Plans:**
| Plan ID | Price | Roasts/Day | Features |
|---------|-------|------------|----------|
| `free` | $0 | 3 | Basic roast, nice mode |
| `pro_monthly` | $9.99/mo | 50 | Gordon Ramsay mode, detailed reports, priority |
| `pro_yearly` | $89.99/yr | 50 | Same as Pro Monthly (save 25%) |
| `team_monthly` | $29.99/mo | 200 | Team dashboard, bulk uploads, API access |

---

#### POST /billing/cancel 🔒
Cancel the current subscription at the end of the billing period.

**Response (200):**
```json
{
  "message": "Subscription will be cancelled at the end of the current period.",
  "cancelAt": "2026-03-02T00:00:00Z"
}
```

---

#### POST /billing/webhook
Stripe webhook endpoint (called by Stripe, not by clients).

**Handled Events:**
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate subscription |
| `invoice.payment_succeeded` | Renew subscription |
| `invoice.payment_failed` | Mark payment as failed, notify user |
| `customer.subscription.deleted` | Downgrade to free tier |

---

### 5. Admin Endpoints

#### GET /admin/stats 🔒🛡️
Get platform-wide statistics. **Requires admin role.**

**Response (200):**
```json
{
  "totalUsers": 12483,
  "activeSubscriptions": 1847,
  "roastsToday": 3291,
  "roastsAllTime": 287456,
  "revenue": {
    "mtd": 14520.50,
    "lastMonth": 28340.00
  },
  "topIndustries": [
    { "industry": "tech", "percentage": 62.3 },
    { "industry": "finance", "percentage": 18.7 },
    { "industry": "healthcare", "percentage": 11.2 },
    { "industry": "general", "percentage": 7.8 }
  ]
}
```

---

#### GET /admin/users 🔒🛡️
List all users with filtering. **Requires admin role.**

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 25 | Results per page (max 100) |
| `tier` | String | — | Filter by `free`, `pro`, or `team` |
| `search` | String | — | Search by name or email |

**Response (200):**
```json
{
  "users": [
    {
      "id": "usr_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "tier": "pro",
      "totalRoasts": 14,
      "joinedAt": "2026-01-15T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "totalItems": 12483,
    "totalPages": 500
  }
}
```

---

## Rate Limiting

All API endpoints are rate-limited to protect the service.

| Tier | Requests/Minute | Roasts/Day |
|------|-----------------|------------|
| Free | 30 | 3 |
| Pro | 120 | 50 |
| Team | 300 | 200 |
| Admin | 600 | Unlimited |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 117
X-RateLimit-Reset: 1709398800
```

**Rate Limit Exceeded (429):**
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again in 42 seconds.",
    "retryAfterSeconds": 42
  }
}
```

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A human-readable description of the error.",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

**Common Error Codes:**
| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `RATE_LIMITED` | 429 | Too many requests |
| `QUOTA_EXCEEDED` | 429 | Daily roast limit reached |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | AI service or database temporarily down |

---

## SDK & Integration Examples

### cURL — Upload & Roast
```bash
# Upload a resume
curl -X POST https://roastmyresume.com/api/resume/upload \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -F "file=@resume.pdf" \
  -F "mode=roast" \
  -F "industry=tech"

# Poll status
curl https://roastmyresume.com/api/roast/rst_abc123def456/status \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Get result
curl https://roastmyresume.com/api/roast/rst_abc123def456 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### JavaScript (Fetch)
```javascript
// Upload resume
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("mode", "roast");
formData.append("industry", "tech");

const uploadRes = await fetch("/api/resume/upload", {
  method: "POST",
  body: formData,
});
const { jobId, pollUrl } = await uploadRes.json();

// Poll until complete
let result;
while (true) {
  const statusRes = await fetch(pollUrl);
  const status = await statusRes.json();
  if (status.status === "completed") {
    const roastRes = await fetch(status.resultUrl);
    result = await roastRes.json();
    break;
  } else if (status.status === "failed") {
    throw new Error(status.error);
  }
  await new Promise((r) => setTimeout(r, 2000));
}

console.log(result.roastTitle);
console.log(`Score: ${result.overallScore}/100`);
```

### Python (Requests)
```python
import requests
import time

BASE = "https://roastmyresume.com/api"
COOKIES = {"next-auth.session-token": "YOUR_TOKEN"}

# Upload resume
with open("resume.pdf", "rb") as f:
    res = requests.post(
        f"{BASE}/resume/upload",
        files={"file": f},
        data={"mode": "roast", "industry": "tech"},
        cookies=COOKIES,
    )

job = res.json()

# Poll until complete
while True:
    status = requests.get(f"{BASE}{job['pollUrl']}", cookies=COOKIES).json()
    if status["status"] == "completed":
        result = requests.get(f"{BASE}{status['resultUrl']}", cookies=COOKIES).json()
        break
    elif status["status"] == "failed":
        raise Exception(status["error"])
    time.sleep(2)

print(f"🔥 {result['roastTitle']}")
print(f"📊 Score: {result['overallScore']}/100")
for section in result["sections"]:
    print(f"\n--- {section['name']} ({section['score']}/100) ---")
    print(section["roast"])
```

---

## Versioning

The API is currently **v1** (unversioned URL). Future breaking changes will be deployed under `/api/v2/...` with a 6-month deprecation window for the previous version.

## Changelog
| Date | Change |
|------|--------|
| 2026-03-02 | Initial API release (v1) |
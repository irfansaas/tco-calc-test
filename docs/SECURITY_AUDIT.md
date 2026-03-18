# Security & Compliance Audit — TCO Calculator

## Audit Information

| Field | Value |
|-------|-------|
| **Project Name** | Nerdio TCO Calculator |
| **Audit Date** | 2026-03-18 |
| **Audit Type** | Internal code review |
| **Scope** | Full application — frontend, data storage, deployment |
| **Classification** | Internal |

---

## Executive Summary

**Overall Risk Level:** Medium

The TCO Calculator is a client-side web application with Firebase Firestore for data persistence. It handles no authentication directly (delegated to ve-tools portal), stores no user PII beyond client company names, and processes no payment data. The primary risks are around data access controls in Firestore and input validation.

---

## 1. Authentication & Access Control

| Check | Status | Notes |
|-------|--------|-------|
| App-level authentication | N/A | Delegated to ve-tools portal |
| User context validation | Pass | `useUserContext.ts` validates origin for postMessage |
| Persona-based access control | Pass | `usePersona.ts` controls UI feature visibility |
| Firestore security rules | Pass | User-scoped read/write with ownership checks |

**Notes:**
- Authentication is handled entirely by the parent ve-tools portal
- User context is received via URL params or `window.postMessage` with origin validation
- Persona system controls UI visibility but is client-side only — not a security boundary

---

## 2. Data Security

### 2.1 Data Classification

| Data Type | Classification | Storage | Encryption | Notes |
|-----------|---------------|---------|------------|-------|
| Client company names | Internal | Firestore + localStorage | In transit (TLS) | No PII — company names only |
| TCO calculations | Internal | Firestore + localStorage | In transit (TLS) | Pricing assumptions and results |
| Persona selection | Low | localStorage | None needed | UI preference only |
| Calculator state | Low | sessionStorage | None needed | Ephemeral per-session |

### 2.2 Data Handling

| Check | Status | Notes |
|-------|--------|-------|
| PII minimization | Pass | No user PII stored — only company names |
| Data retention | Review | No automatic cleanup of old scenarios |
| No sensitive data in logs | Pass | Only `console.error` for error handling |
| No sensitive data in URLs | Pass | User context params don't contain secrets |

---

## 3. Application Security

### 3.1 OWASP Top 10

| Vulnerability | Status | Notes |
|---------------|--------|-------|
| A01: Broken Access Control | Pass | Firestore rules enforce user-scoped access |
| A02: Cryptographic Failures | N/A | No passwords, tokens, or secrets stored client-side |
| A03: Injection | Pass | Client name sanitized; jsPDF text rendering not vulnerable to injection |
| A04: Insecure Design | Pass | Client-side tool with no server-side logic to exploit |
| A05: Security Misconfiguration | Review | CSP headers present but include `unsafe-eval` — see notes |
| A06: Vulnerable Components | Review | Run `npm audit` periodically |
| A07: Auth Failures | N/A | No auth handled in this app |
| A08: Software/Data Integrity | Pass | Lock file committed; Vercel builds from source |
| A09: Logging/Monitoring | Review | Console-only logging; no structured error reporting |
| A10: Server-Side Request Forgery | N/A | No server-side code |

### 3.2 Input Validation

| Check | Status | Notes |
|-------|--------|-------|
| Client name validation | Pass | Max length enforced, HTML stripped |
| User count bounds | Pass | Min 10, max 100,000 enforced in UI |
| Pricing field bounds | Pass | Slider limits + manual input validation |
| Number input types | Pass | `inputMode="numeric"` on mobile inputs |

### 3.3 Error Handling

| Check | Status | Notes |
|-------|--------|-------|
| Generic error messages to users | Pass | Toast notifications with safe messages |
| No stack traces exposed | Pass | Errors caught and logged to console only |
| Fail securely | Pass | Calculator defaults to safe values on error |

---

## 4. Security Headers (vercel.json)

| Header | Configured | Value | Status |
|--------|------------|-------|--------|
| X-Frame-Options | Yes | SAMEORIGIN | Pass |
| X-Content-Type-Options | Yes | nosniff | Pass |
| Referrer-Policy | Yes | strict-origin-when-cross-origin | Pass |
| Permissions-Policy | Yes | camera=(), microphone=(), geolocation=() | Pass |
| Content-Security-Policy | Yes | See below | Review |

**CSP Policy Review:**
- `default-src 'self'` — Good baseline
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'` — `unsafe-eval` needed for Next.js dev; consider nonce-based approach for production
- `style-src 'self' 'unsafe-inline'` — Required for Tailwind CSS and Framer Motion inline styles
- `connect-src` — Scoped to Firebase domains only
- `frame-ancestors` — Restricted to `self` and `*.vercel.app`

**Recommendation:** Document why `unsafe-eval` is needed and consider removing for production builds if Next.js supports it.

---

## 5. Dependency Security

### 5.1 Key Dependencies

| Package | Version | License | Risk Level |
|---------|---------|---------|------------|
| next | 16.0.10 | MIT | Low — actively maintained |
| react / react-dom | 19.2.1 | MIT | Low |
| firebase | ^12.10.0 | Apache-2.0 | Low — Google maintained |
| jspdf | ^3.0.4 | MIT | Low |
| framer-motion | ^12.23.26 | MIT | Low |
| lucide-react | ^0.561.0 | ISC | Low |

### 5.2 Audit Status

Run `npm audit` before each release to check for known vulnerabilities.

---

## 6. Firebase Security

| Check | Status | Notes |
|-------|--------|-------|
| API key exposure | Acceptable | Firebase API keys are designed to be public; Firestore rules protect data |
| Firestore rules | Pass | User-scoped ownership enforced |
| No admin SDK in client | Pass | Client SDK only — no elevated privileges |
| Data validation | Review | Consider adding Firestore validation rules for document structure |

---

## 7. Deployment Security

| Check | Status | Notes |
|-------|--------|-------|
| Environment variables | Pass | `.env` files gitignored; `.env.example` provided |
| Vercel deployment | Pass | Builds from source; no secrets in build output |
| HTTPS enforced | Pass | Vercel enforces HTTPS by default |
| Preview deployments | Review | Vercel preview URLs are public — ensure no sensitive data in previews |

---

## Recommendations

| Priority | Recommendation | Status |
|----------|---------------|--------|
| P1 | Firestore rules enforce user-scoped access | Done |
| P1 | Input validation on client name and pricing | Done |
| P2 | Run `npm audit` before each release | Process |
| P2 | Add structured error logging (replace console.error) | Future |
| P3 | Consider CSP nonce-based approach for production | Future |
| P3 | Add data retention / cleanup for old scenarios | Future |
| P3 | Add Firestore document structure validation | Future |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-18 | Value Engineering | Initial audit |

## PR Information

**Type:**
- [ ] Feature — New functionality
- [ ] Bugfix — Fix for an issue
- [ ] Refactor — Code improvement (no behavior change)
- [ ] Documentation — Docs only
- [ ] Chore — Maintenance, dependencies, config

**Related Issues:** Closes #

---

## Description

### What does this PR do?

### Why is this change needed?

### How was this tested?

---

## Checklist

### Code Quality
- [ ] TypeScript strict mode — no `any` types
- [ ] No commented-out code or console.logs
- [ ] No hardcoded values (use constants from `calculations.ts`)
- [ ] Error handling implemented
- [ ] Functions follow single responsibility principle

### Calculation Engine (if `calculations.ts` changed)
- [ ] Formulas verified against Excel reference
- [ ] Unit tests added/updated in `calculations.test.ts`
- [ ] All existing tests pass (`npm run test`)
- [ ] `CalculatorOutput` interface updated if needed

### Persona System (if UI visibility changed)
- [ ] SDR view tested — appropriate restrictions in place
- [ ] AE view tested — pricing editable, infrastructure read-only
- [ ] SE/VE view tested — full access works correctly
- [ ] Persona config in `usePersona.ts` updated if needed

### Security
- [ ] No sensitive data exposed (API keys, internal pricing strategy)
- [ ] User inputs sanitized (client name, pricing fields)
- [ ] Firestore rules unchanged or reviewed for new collections
- [ ] No new `unsafe-eval` or `unsafe-inline` requirements

### UI/UX
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Loading states implemented
- [ ] Error states handled gracefully
- [ ] Framer Motion animations respect `prefers-reduced-motion`

### Testing
- [ ] Unit tests pass (`npm run test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing completed on `/` and `/simple` routes

### PDF Export (if results display changed)
- [ ] PDF export still renders correctly
- [ ] Client name appears in PDF header
- [ ] Cost comparison table reflects changes
- [ ] File downloads with correct naming

---

## Screenshots (if UI changes)

| Before | After |
|--------|-------|
| | |

---

## Deployment Notes

- [ ] Environment variables documented (if new ones added)
- [ ] Vercel preview deployment tested
- [ ] No breaking changes to saved scenario format

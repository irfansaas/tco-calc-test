# TCO Calculator - Development Guide

## Project Overview

**Citrix to Azure Virtual Desktop (AVD) Total Cost of Ownership Calculator** for the Nerdio Value Engineering team. Takes one input (user count) and generates a full cost comparison between on-premises Citrix and cloud-based Azure Virtual Desktop with Nerdio.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 + Framer Motion |
| Icons | Lucide React |
| PDF Export | jsPDF |
| Backend | Firebase Firestore - client-side SDK |
| Testing | Vitest |
| Linting | ESLint 9 + eslint-config-next |

## Quick Start

```bash
npm install
cp .env.example .env.local   # Fill in Firebase credentials
npm run dev                   # http://localhost:3000
npm run build                 # Production build
npm run test                  # Run tests
npm run lint                  # Lint check
npm run type-check            # TypeScript check
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, metadata
│   ├── page.tsx                # Main page (renders Calculator)
│   ├── globals.css             # Global styles
│   └── simple/page.tsx         # Simple mode calculator
├── components/
│   ├── calculator/
│   │   ├── Calculator.tsx      # Main calculator orchestrator
│   │   ├── EnhancedResultsPanel.tsx  # Full results display
│   │   ├── PricingPanel.tsx    # Custom pricing config
│   │   ├── AdvancedSettingsPanel.tsx  # Advanced settings
│   │   ├── SavedScenarios.tsx  # Scenario management
│   │   └── SavingsBanner.tsx   # Savings display
│   ├── architecture/           # Infrastructure visualization
│   │   ├── ArchitectureDiagram.tsx   # Main diagram component
│   │   └── StateColumn.tsx     # Current/Future state columns
│   ├── cost-of-delay/          # Cost of delay panel
│   ├── icons/index.tsx         # Custom SVG icons
│   ├── ui/                     # Reusable UI components
│   │   ├── PersonaSelector.tsx # Role selector (SDR/AE/SE/VE)
│   │   ├── Button.tsx, Card.tsx, Input.tsx
│   │   ├── ConfirmModal.tsx, Toast.tsx
│   └── Providers.tsx           # Client-side providers wrapper
├── hooks/
│   ├── useCalculator.ts        # Calculator logic hook
│   ├── usePersona.ts           # Persona/role management
│   ├── useUserContext.ts       # User context from ve-tools portal
│   ├── useScenarios.ts         # Scenario CRUD hook
│   ├── useCostOfDelay.ts       # Cost of delay calculations
│   └── useReducedMotion.ts     # Accessibility
├── lib/
│   ├── calculations.ts         # Core calculation engine
│   ├── calculations.test.ts    # Unit tests
│   ├── types.ts                # Shared TypeScript types
│   ├── pdfExport.ts            # PDF generation
│   ├── scenarioStorage.ts      # localStorage scenario management
│   └── firebase/
│       ├── client.ts           # Firebase client config
│       ├── scenarioService.ts  # Cloud sync CRUD operations
│       ├── migrateLocalData.ts # localStorage → Firestore migration
│       └── index.ts            # Module exports
docs/                           # Technical documentation
sales-enablement/               # Architecture & data docs
firestore.rules                 # Firestore security rules
vercel.json                     # Vercel deployment config with security headers
```

## Key Architecture Decisions

### Calculation Engine (`src/lib/calculations.ts`)
- All formulas verified against validated Excel spreadsheet
- Two deployment modes: **Cloud** (full AVD migration) and **Hybrid** (on-prem + cloud)
- Pure functions — no side effects, fully testable
- Key function: `calculate(inputs)` returns `CalculatorOutput`

### Persona System (`src/hooks/usePersona.ts`)
Four roles with different UI permissions:

| Persona | Edit Pricing | Edit Infrastructure | Edit Formulas | Advanced Settings |
|---------|-------------|-------------------|--------------|------------------|
| SDR | No | No | No | No |
| AE | Yes | No | No | Yes |
| SE | Yes | Yes | Yes | Yes |
| VE | Yes | Yes | Yes | Yes |

- Stored in `localStorage` key: `tco_calculator_persona`
- Can also be set via user context from ve-tools portal
- Controls which UI panels and inputs are visible/editable

### Authentication
- **No standalone auth** — this app does not handle login/logout
- Auth is handled at the portal level (ve-tools)
- User context (userId, role, email) is received via:
  1. URL search params (for direct linking / iframe src)
  2. `window.postMessage` (for iframe communication)
- See `src/hooks/useUserContext.ts`

### Data Storage
- **Primary**: Firebase Firestore via client-side SDK
- **Fallback**: localStorage when Firebase is not configured
- Collection: `tco_scenarios` (see `firestore.rules`)
- Auto-migration from localStorage to Firestore on first connection

### State Management
- React hooks + `sessionStorage` for calculator state persistence
- `localStorage` for persona selection and saved scenarios
- `useSyncExternalStore` for reactive localStorage reads
- No external state management library

## Environment Variables

```bash
# Required for cloud sync
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Optional
NEXT_PUBLIC_VE_TOOLS_ORIGIN=https://ve-tools.vercel.app
NEXT_PUBLIC_CONTACT_URL=https://nerdio.com/contact/
```

## Firestore Schema

Single collection `tco_scenarios`:
- `id` string (document ID)
- `clientName` string
- `createdAt` string (ISO 8601)
- `userCount` number
- `concurrencyRate`, `mauRate`, `nerdioLicense` number
- `includeWindowsServer`, `includeNerdio` boolean
- `pricing` object (custom pricing overrides)
- `result` object (complete calculation output)

## Coding Conventions

### Code Style
- All components use `'use client'` directive (client-side rendering)
- Functional components with hooks pattern
- TypeScript strict mode — no `any` types
- Tailwind for all styling (no CSS modules)
- Framer Motion for animations

### File Naming
- Components: PascalCase (`Calculator.tsx`, `InputPanel.tsx`)
- Hooks: camelCase with `use` prefix (`usePersona.ts`)
- Utils/libs: camelCase (`calculations.ts`, `pdfExport.ts`)

### Import Aliases
- `@/` maps to `src/` (configured in `tsconfig.json`)

### Testing
- Vitest for unit tests
- Test files co-located with source: `*.test.ts`
- Run: `npm run test` or `npm run test:watch`

## Security Considerations
- Never commit `.env` files (`.gitignore` configured)
- Firebase API key is public-facing (by design) — Firestore rules protect data
- No standalone auth code — ve-tools portal handles authentication
- All API calls are client-side (no server-side secrets in this app)
- No user PII stored beyond client company names in scenarios
- Security headers configured in `vercel.json` (CSP, X-Frame-Options, etc.)
- Input sanitization applied to user-provided values (client name, pricing)

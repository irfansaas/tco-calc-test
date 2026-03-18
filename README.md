# Citrix to AVD TCO Calculator

A sales enablement tool for comparing Total Cost of Ownership between Citrix VDI and Azure Virtual Desktop (AVD) with Nerdio.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Overview

This calculator helps Nerdio sales teams demonstrate cost savings when migrating from Citrix to AVD. It provides:

- **Visual Architecture Comparison** - Side-by-side current vs. future state diagrams
- **TCO Analysis** - Annual savings with percentage headline
- **Cost of Delay** - Live ticking counter showing money lost by waiting
- **PDF Export** - Client-branded reports for follow-up
- **Persona-Based Views** - SDR, AE, SE, VE modes with appropriate complexity

## Personas

| Role | Capabilities |
|------|-------------|
| **SDR** | Input users only, see $0 line items as conversation starters |
| **AE** | Edit pricing, adjust concurrency/MAU, save scenarios |
| **SE** | Full infrastructure customization, formula overrides |
| **VE** | Complete access including advanced settings |

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **PDF**: jsPDF
- **Testing**: Vitest

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Main calculator
│   └── simple/page.tsx    # Simple mode
├── components/
│   ├── calculator/        # Core calculator UI
│   ├── architecture/      # Visual diagrams
│   ├── cost-of-delay/     # Urgency panel
│   └── ui/                # Shared components
├── hooks/
│   └── usePersona.ts      # Role-based access
└── lib/
    ├── calculations.ts    # TCO engine
    ├── pdfExport.ts       # PDF generation
    └── scenarioStorage.ts # Scenario persistence
```

## Documentation

- [Architecture](./sales-enablement/ARCHITECTURE.md) - System design and component flow
- [Data Dictionary](./sales-enablement/DATA_DICTIONARY.md) - All calculations and formulas
- [Sourcing Ledger](./sales-enablement/SOURCING_LEDGER.md) - Data sources and assumptions
- [Runbook](./sales-enablement/RUNBOOK.md) - Sales FAQ and glossary
- [Field Enablement](./sales-enablement/FIELD_ENABLEMENT.md) - Training guide for SDR/AE/SE

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Run tests
```

## Version

Current: v1.0 (Q1 2026 Release)
Roadmap: W365 comparison coming post-Q1 enablement

## License

Internal use only - Nerdio

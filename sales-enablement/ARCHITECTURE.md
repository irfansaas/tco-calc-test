# Architecture Documentation

## System Overview

The TCO Calculator is a Next.js 16 application that compares Citrix VDI costs against Azure Virtual Desktop (AVD) with Nerdio management.

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   InputPanel    │ ArchitectureDiagram │   ResultsPanel          │
│   (User count)  │ (Visual comparison) │   (Savings, PDF)        │
└────────┬────────┴────────┬────────────┴──────────┬──────────────┘
         │                 │                       │
         ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      State Management                            │
│              usePersona Hook + Session Storage                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Calculation Engine                            │
│                   src/lib/calculations.ts                        │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Calculator.tsx (Main orchestrator)
├── PersonaSelector.tsx (Role selection)
├── InputPanel (User inputs)
│   ├── Client Name (mandatory)
│   ├── User Count (mandatory)
│   ├── Concurrency/MAU sliders (AE+)
│   ├── Toggle switches (AE+)
│   └── PricingPanel.tsx (AE+)
├── AdvancedSettingsPanel.tsx (SE/VE only)
├── EnhancedResultsPanel.tsx (Results view)
│   ├── SavingsBanner.tsx (Headline savings %)
│   ├── ArchitectureDiagram.tsx (Visual comparison)
│   │   ├── StateColumn.tsx (Current/Future state)
│   │   └── CostBadge.tsx (Cost annotations)
│   ├── CostOfDelayPanel.tsx (Urgency ticking)
│   └── PDF Export button
└── SavedScenarios.tsx (AE+)
```

## Data Flow

### Input → Calculation → Display

```
1. User enters user count
           ↓
2. Calculator.tsx calls calculate()
           ↓
3. calculations.ts computes:
   - Concurrent users = userCount × concurrencyRate
   - MAU users = userCount × mauRate
   - Session hosts = concurrentUsers / usersPerHost
   - Physical servers = (sessionHosts × cores) / serverCores
           ↓
4. OnPrem costs calculated:
   - Citrix license = rate × concurrentUsers
   - RDS CAL = rate × totalUsers
   - Windows Server = rate × servers × cores
           ↓
5. Cloud costs calculated:
   - AVD compute = rate × concurrentUsers
   - Nerdio = rate × mauUsers
           ↓
6. Savings = OnPrem - Cloud
           ↓
7. Results rendered in EnhancedResultsPanel
```

## Persona System

The `usePersona` hook controls feature visibility:

```typescript
type Persona = 'SDR' | 'AE' | 'SE' | 'VE';

// Feature matrix
┌────────────────────────┬─────┬─────┬─────┬─────┐
│ Feature                │ SDR │ AE  │ SE  │ VE  │
├────────────────────────┼─────┼─────┼─────┼─────┤
│ Input user count       │  ✓  │  ✓  │  ✓  │  ✓  │
│ See cost breakdown     │  ✓  │  ✓  │  ✓  │  ✓  │
│ Edit pricing           │     │  ✓  │  ✓  │  ✓  │
│ Concurrency sliders    │     │  ✓  │  ✓  │  ✓  │
│ Toggle switches        │     │  ✓  │  ✓  │  ✓  │
│ Save scenarios         │     │  ✓  │  ✓  │  ✓  │
│ Edit infrastructure    │     │     │  ✓  │  ✓  │
│ Formula overrides      │     │     │  ✓  │  ✓  │
│ Advanced settings      │     │     │  ✓  │  ✓  │
└────────────────────────┴─────┴─────┴─────┴─────┘
```

## Architecture Diagram Component

The `ArchitectureDiagram.tsx` renders visual infrastructure:

### Current State (Citrix)
```
┌─────────────────────────────────┐
│           USERS (N)             │
├─────────────────────────────────┤
│     CITRIX BROKER LAYER         │
│  (StoreFront, Delivery Ctrl)    │
├─────────────────────────────────┤
│       SESSION HOSTS             │
│    (VMs with RDS CALs)          │
├─────────────────────────────────┤
│      PHYSICAL SERVERS           │
│   (VMware/Hypervisor layer)     │
└─────────────────────────────────┘
```

### Future State (AVD)
```
┌─────────────────────────────────┐
│           USERS (N)             │
├─────────────────────────────────┤
│         AZURE AVD               │
│   (Microsoft managed broker)    │
├─────────────────────────────────┤
│       SESSION HOSTS             │
│   (Azure VMs, pay-per-use)      │
├─────────────────────────────────┤
│          NERDIO                 │
│   (Management & optimization)   │
└─────────────────────────────────┘
```

## Storage Architecture

### Session Storage (per-session persistence)
- Calculator input state
- Persona-specific (isolated between roles)
- Key format: `tco_calculator_state_{persona}`

### Local Storage (cross-session persistence)
- Selected persona
- Advanced toggle preference
- Saved scenarios

## PDF Export Flow

```
1. User clicks "Export PDF"
           ↓
2. exportToPDF() in lib/pdfExport.ts
           ↓
3. Captures results-container via DOM
           ↓
4. Generates jsPDF document with:
   - Client name header
   - User count and assumptions
   - Cost comparison table
   - Savings summary
   - Timestamp footer
           ↓
5. Downloads as {clientName}_TCO_Analysis.pdf
```

## Deployment Modes

### Cloud Mode (Default)
- Full migration to Azure AVD
- Eliminates Citrix, RDS CAL, Windows Server, physical servers
- Adds AVD compute + Nerdio license

### Hybrid Mode (Future)
- Keeps existing hardware
- Replaces Citrix with Nerdio
- Potential hypervisor savings (Broadcom → Nutanix)
- RDS CALs and Windows Server remain

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/calculations.ts` | TCO calculation engine |
| `src/hooks/usePersona.ts` | Role-based feature control |
| `src/components/calculator/Calculator.tsx` | Main orchestrator |
| `src/components/architecture/ArchitectureDiagram.tsx` | Visual comparison |
| `src/components/cost-of-delay/CostOfDelayPanel.tsx` | Urgency display |
| `src/lib/pdfExport.ts` | PDF generation |

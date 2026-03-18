# Sourcing Ledger

This document tracks all data sources and assumptions used in the TCO Calculator.

## Pricing Data Sources

### Citrix Licensing
| Item | Value | Source | Last Updated |
|------|-------|--------|--------------|
| Citrix per concurrent user | $185.32/year | Victor's Excel (J14) | Jan 2026 |
| Notes | Based on Citrix Universal licensing typical renewal | | |

### Microsoft Licensing
| Item | Value | Source | Last Updated |
|------|-------|--------|--------------|
| RDS CAL per user | $66/year | Victor's Excel (J15) | Jan 2026 |
| Windows Server per core | $160/year | Victor's Excel (J16) | Jan 2026 |
| Notes | Based on Microsoft Volume Licensing typical costs | | |

### Azure / AVD Costs
| Item | Value | Source | Last Updated |
|------|-------|--------|--------------|
| AVD compute per user | $11/month | Victor's Excel | Jan 2026 |
| Business hours assumption | 8.5 hours/day (08:00-16:30) | | |
| Notes | Assumes autoscaling with Nerdio, not 24/7 running | | |

### Nerdio Licensing
| Item | Value | Source | Last Updated |
|------|-------|--------|--------------|
| Nerdio Manager per MAU | $8/month (default) | Nerdio pricing | Jan 2026 |
| Range | $4-15/month configurable | | |
| Notes | Billed per Monthly Active User, not named users | | |

### Infrastructure / CapEx
| Item | Value | Source | Last Updated |
|------|-------|--------|--------------|
| Server hardware per server | $3,500/year | Industry estimate | Jan 2026 |
| Calculation basis | ~$10k-17k server / 3-5 year depreciation | | |
| Notes | Shown as $0 by default to enable discovery | | |

## Infrastructure Assumptions

### VM Sizing
| Parameter | Default Value | Source |
|-----------|---------------|--------|
| Cores per host | 8 | Victor's Excel (C28) |
| Memory per host | 32 GB | Victor's Excel (C29) |
| Users per host | 16 | Victor's Excel (C30) |
| Cores per physical server | 64 | Standard 2-socket server |

### User Behavior
| Parameter | Default Value | Source |
|-----------|---------------|--------|
| Concurrency rate | 40% | Victor's Excel (B22) |
| MAU rate | 50% | Victor's Excel (B23) |
| Relationship | MAU = Concurrency + 10% (typical) | |

## Calculation Formulas

### Infrastructure Sizing
```
Concurrent Users = Total Users × Concurrency Rate
MAU Users = Total Users × MAU Rate
Session Hosts = Concurrent Users / Users Per Host
Physical Servers = (Session Hosts × Cores Per Host) / Server Cores + Buffer
```

### Cost Formulas
```
Citrix Annual = Citrix Rate × Concurrent Users
RDS CAL Annual = RDS Rate × Total Users
Windows Server Annual = Windows Rate × Servers × Cores Per Server
AVD Monthly = AVD Rate × Concurrent Users
Nerdio Monthly = Nerdio Rate × MAU Users
```

## Data Validation Status

| Data Point | Validated By | Date | Notes |
|------------|--------------|------|-------|
| Citrix pricing | Victor | Jan 2026 | Matched against Excel |
| RDS CAL pricing | Victor | Jan 2026 | Matched against Excel |
| Windows Server pricing | Victor | Jan 2026 | Matched against Excel |
| AVD compute | Victor | Jan 2026 | Based on autoscale model |
| Nerdio licensing | Product team | Jan 2026 | Current list pricing |
| Concurrency default | Victor | Jan 2026 | Industry standard |

## Known Limitations

1. **AVD compute is simplified** - Actual Azure costs vary by region, VM type, reserved instances
2. **Server hardware is estimated** - Real CapEx varies significantly by vendor/spec
3. **No network costs** - Bandwidth, ExpressRoute not included
4. **No migration costs** - Implementation services not modeled
5. **No support costs** - Annual support/maintenance contracts not included

## Update Procedures

### Quarterly Review
- [ ] Verify Citrix pricing against current contracts
- [ ] Check Microsoft licensing changes
- [ ] Update Azure pricing calculator comparison
- [ ] Validate Nerdio pricing with product team

### Annual Review
- [ ] Full recalculation of CapEx depreciation
- [ ] Infrastructure sizing benchmarks
- [ ] Concurrency/MAU industry standards

## Change Log

| Date | Change | Changed By |
|------|--------|------------|
| Jan 2026 | Initial pricing from Victor's Excel | Engineering |
| | | |

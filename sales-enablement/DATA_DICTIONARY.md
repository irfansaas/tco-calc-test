# Data Dictionary & Calculations

Complete reference for all variables, formulas, and data types in the TCO Calculator.

## Input Variables

### Primary Inputs
| Variable | Type | Range | Default | Description |
|----------|------|-------|---------|-------------|
| `userCount` | number | 10-100,000 | 600 | Total RDS CAL / named user count |
| `clientName` | string | - | "" | Client company name (required) |
| `concurrencyRate` | number | 0.10-1.00 | 0.40 | % of users active simultaneously |
| `mauRate` | number | 0.10-1.00 | 0.50 | % of users active monthly |

### Toggle Options
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `includeWindowsServer` | boolean | true | Include Windows Server licensing |
| `includeNerdio` | boolean | true | Include Nerdio license in AVD cost |
| `includeServerHardware` | boolean | true | Include server CapEx amortization |

### Custom Pricing
| Variable | Type | Default | Unit | Description |
|----------|------|---------|------|-------------|
| `citrixPerConcurrent` | number | 185.32 | $/user/year | Citrix license cost |
| `rdsCalPerUser` | number | 66 | $/user/year | RDS CAL cost |
| `windowsSvrPerCore` | number | 160 | $/core/year | Windows Server cost |
| `avdComputePerUser` | number | 11 | $/user/month | Azure VM compute |
| `nerdioLicense` | number | 8 | $/user/month | Nerdio Manager license |
| `serverHardwarePerServer` | number | 3500 | $/server/year | CapEx amortization |

## Computed Variables

### Infrastructure Calculations
| Variable | Formula | Description |
|----------|---------|-------------|
| `concurrentUsers` | `userCount × concurrencyRate` | Users active at same time |
| `mauUsers` | `userCount × mauRate` | Monthly active users |
| `sessionHostsNeeded` | `ceil(concurrentUsers / usersPerHost)` | VMs required |
| `physicalServersNeeded` | `ceil((sessionHosts × coresPerHost) / coresPerServer) + buffer` | Physical servers |

### On-Prem Costs (Annual)
| Variable | Formula | Description |
|----------|---------|-------------|
| `citrixLicense` | `citrixRate × concurrentUsers` | Citrix annual cost |
| `rdsCalLicense` | `rdsCalRate × userCount` | RDS CAL annual cost |
| `windowsServerLicense` | `windowsRate × physicalServers × coresPerServer` | Windows Server cost |
| `serverHardwareSessionHosts` | `serverHardwareRate × physicalServers` | CapEx annual |
| `onPremTotalAnnual` | `sum of above` | Total on-prem annual |
| `onPremTotalMonthly` | `onPremTotalAnnual / 12` | Monthly equivalent |

### Cloud Costs (Monthly)
| Variable | Formula | Description |
|----------|---------|-------------|
| `avdCompute` | `avdRate × concurrentUsers` | Azure compute monthly |
| `nerdioLicenseCost` | `nerdioRate × mauUsers` | Nerdio monthly |
| `cloudTotalMonthly` | `avdCompute + nerdioLicense` | Total cloud monthly |
| `cloudTotalAnnual` | `cloudTotalMonthly × 12` | Annual cloud cost |

### Savings Calculations
| Variable | Formula | Description |
|----------|---------|-------------|
| `savingsPercentage` | `((onPremAnnual - cloudAnnual) / onPremAnnual) × 100` | Savings % |
| `savingsMonthly` | `onPremMonthly - cloudMonthly` | Monthly savings $ |
| `savingsAnnual` | `onPremAnnual - cloudAnnual` | Annual savings $ |
| `isCloudCheaper` | `savingsAnnual > 0` | Boolean result |

### Cost of Delay
| Variable | Formula | Description |
|----------|---------|-------------|
| `costPerMonth` | `savingsMonthly` | Money lost per month |
| `costPerYear` | `savingsAnnual` | Money lost per year |
| `costPerDay` | `costPerMonth / 30` | Daily cost |
| `costPerHour` | `costPerDay / 24` | Hourly cost |
| `costPerMinute` | `costPerHour / 60` | Per minute |
| `costPerSecond` | `costPerMinute / 60` | Per second (live ticker) |

## Output Interfaces

### CalculatorOutput
```typescript
{
  infrastructure: {
    concurrentUsers: number;
    mauUsers: number;
    sessionHostsNeeded: number;
    physicalServersNeeded: number;
  };
  onPrem: {
    citrixLicense: number;
    rdsCalLicense: number;
    windowsServerLicense: number;
    hypervisorCost: number;
    totalAnnual: number;
    totalMonthly: number;
    serverHardwareSessionHosts?: number;
  };
  cloud: {
    avdCompute: number;
    nerdioLicense: number;
    totalMonthly: number;
    totalAnnual: number;
  };
  savings: {
    percentage: number;
    monthlyAmount: number;
    annualAmount: number;
    isCloudCheaper: boolean;
  };
  costOfDelay: {
    perSecond: number;
    perMinute: number;
    perHour: number;
    perDay: number;
    perMonth: number;
    perYear: number;
  };
  deploymentMode: 'cloud' | 'hybrid';
}
```

## Constants

### Pricing Defaults (PRICING object)
| Constant | Value | Cell Reference |
|----------|-------|----------------|
| `CITRIX_PER_CONCURRENT` | 185.32 | J14 |
| `RDS_CAL_PER_USER` | 66 | J15 |
| `WINDOWS_SVR_PER_CORE` | 160 | J16 |
| `SERVER_HARDWARE_PER_SERVER` | 3500 | - |
| `AVD_COMPUTE_PER_USER` | 11 | - |
| `NERDIO_LICENSE_DEFAULT` | 8 | C25 |
| `CORES_PER_HOST` | 8 | C28 |
| `MEMORY_GB` | 32 | C29 |
| `USERS_PER_HOST` | 16 | C30 |
| `CORES_PER_SERVER` | 64 | - |

### Behavior Defaults (DEFAULTS object)
| Constant | Value | Cell Reference |
|----------|-------|----------------|
| `CONCURRENCY_RATE` | 0.40 | B22 |
| `MAU_RATE` | 0.50 | B23 |

## Example Calculation

For 600 users with defaults:

```
Input:
  userCount = 600
  concurrencyRate = 0.40
  mauRate = 0.50

Infrastructure:
  concurrentUsers = 600 × 0.40 = 240
  mauUsers = 600 × 0.50 = 300
  sessionHosts = ceil(240 / 16) = 15
  physicalServers = ceil((15 × 8) / 64) + 1 = 3

On-Prem Annual:
  citrixLicense = $185.32 × 240 = $44,477
  rdsCalLicense = $66 × 600 = $39,600
  windowsServer = $160 × 3 × 64 = $30,720
  serverHardware = $3,500 × 3 = $10,500
  TOTAL = $125,297/year

Cloud Annual:
  avdCompute = $11 × 240 × 12 = $31,680
  nerdioLicense = $8 × 300 × 12 = $28,800
  TOTAL = $60,480/year

Savings:
  annual = $125,297 - $60,480 = $64,817
  percentage = 51.7%
  monthly = $5,401
  perSecond = $0.0021
```

## Validation Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Minimum users | userCount < 10 | Disable calculation |
| Max users | userCount > 100,000 | Warning |
| Concurrency > MAU | concurrencyRate > mauRate | Show warning |
| Client name empty | clientName.trim() === '' | Disable calculation |

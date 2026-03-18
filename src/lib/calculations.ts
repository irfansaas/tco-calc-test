// Core calculation engine - Verified against Victor's Excel sheet
// All formulas match the spreadsheet exactly

export type DeploymentMode = 'cloud' | 'hybrid';

export const PRICING = {
  // Column J values from Victor's sheet - Annual costs
  CITRIX_PER_CONCURRENT: 185.32,     // J14 - Citrix license per concurrent user/year
  RDS_CAL_PER_USER: 66,              // J15 - RDS CAL per user/year
  WINDOWS_SVR_PER_CORE: 160,         // J16 - Windows Server license per core/year

  // Infrastructure CapEx - Annual amortized costs per physical server
  // ~$3,500/server/year based on typical 3-5 year depreciation of ~$10k-17k servers
  SERVER_HARDWARE_PER_SERVER: 3500,

  // Cloud costs - Monthly
  AVD_COMPUTE_PER_USER: 11,          // $11/user/month (business hours 08:00-16:30)
  NERDIO_LICENSE_DEFAULT: 10,        // C25 - Default $10/MAU/month (Nerdio Standard)

  // Configuration from Victor's sheet
  CORES_PER_HOST: 8,                 // C28
  MEMORY_GB: 32,                     // C29
  USERS_PER_HOST: 16,                // C30
  CORES_PER_SERVER: 64,              // Physical server spec
} as const;

export const DEFAULTS = {
  CONCURRENCY_RATE: 0.40,            // B22 - 40% default
  MAU_RATE: 0.50,                    // B23 - 50% (concurrency + 10%)
} as const;

// ============================================
// CUSTOMIZATION INTERFACES
// ============================================

// Infrastructure parameters - controls VM/server sizing
export interface InfrastructureConfig {
  coresPerHost: number;              // Cores per session host (default: 8)
  memoryPerHost: number;             // GB RAM per host (default: 32)
  usersPerHost: number;              // Users per session host (default: 16)
  coresPerServer: number;            // Cores per physical server (default: 64)
  serverBuffer: number;              // Extra servers for redundancy (default: 1)
}

export const DEFAULT_INFRASTRUCTURE: InfrastructureConfig = {
  coresPerHost: PRICING.CORES_PER_HOST,
  memoryPerHost: PRICING.MEMORY_GB,
  usersPerHost: PRICING.USERS_PER_HOST,
  coresPerServer: PRICING.CORES_PER_SERVER,
  serverBuffer: 1,
};

// Business hours configuration - affects AVD compute cost
export interface BusinessHoursConfig {
  hoursPerDay: number;               // Operating hours per day (default: 8.5)
  daysPerWeek: number;               // Operating days per week (default: 5)
  weeksPerYear: number;              // Working weeks per year (default: 52)
}

export const DEFAULT_BUSINESS_HOURS: BusinessHoursConfig = {
  hoursPerDay: 8.5,                  // 08:00-16:30
  daysPerWeek: 5,
  weeksPerYear: 52,
};

// Time period configuration - for cost of delay calculations
export interface TimeConfig {
  daysPerMonth: number;              // Days in a month (default: 30)
  hoursPerDay: number;               // Hours in a day (default: 24)
  monthsPerYear: number;             // Months in a year (default: 12)
}

export const DEFAULT_TIME_CONFIG: TimeConfig = {
  daysPerMonth: 30,
  hoursPerDay: 24,
  monthsPerYear: 12,
};

// Formula overrides - bypass calculated values
export interface FormulaOverrides {
  concurrentUsers?: number;          // Override calculated concurrent users
  sessionHosts?: number;             // Override calculated session hosts
  physicalServers?: number;          // Override calculated physical servers
}

// PDF customization options
export interface PDFConfig {
  companyLogo?: string;              // Base64 encoded logo
  footerText: string;                // Footer text (default: "Created by Value Engineering")
  includeTimestamp: boolean;         // Include generation timestamp
  includeAssumptions: boolean;       // Include pricing assumptions section
  includeCostOfDelay: boolean;       // Include cost of delay section
}

export const DEFAULT_PDF_CONFIG: PDFConfig = {
  footerText: 'Created by Value Engineering',
  includeTimestamp: true,
  includeAssumptions: true,
  includeCostOfDelay: true,
};

// Visualization limits - controls diagram display
export interface VisualizationConfig {
  maxServersShown: number;           // Max server icons in diagram (default: 6)
  maxVMsShown: number;               // Max VM icons in diagram (default: 8)
  maxUsersShown: number;             // Max user avatars shown (default: 6)
  usersPerAvatar: number;            // Users represented per avatar (default: 100)
}

export const DEFAULT_VISUALIZATION: VisualizationConfig = {
  maxServersShown: 6,
  maxVMsShown: 8,
  maxUsersShown: 6,
  usersPerAvatar: 100,
};

// Storage configuration - for multi-tenant support
export interface StorageConfig {
  storageKeyPrefix: string;          // Prefix for localStorage/sessionStorage keys
  tenantId?: string;                 // Optional tenant identifier
}

export const DEFAULT_STORAGE: StorageConfig = {
  storageKeyPrefix: 'tco_calculator',
};

// Complete advanced configuration
export interface AdvancedConfig {
  infrastructure?: Partial<InfrastructureConfig>;
  businessHours?: Partial<BusinessHoursConfig>;
  timeConfig?: Partial<TimeConfig>;
  formulaOverrides?: FormulaOverrides;
  pdfConfig?: Partial<PDFConfig>;
  visualization?: Partial<VisualizationConfig>;
  storage?: Partial<StorageConfig>;
}

export interface CustomPricing {
  citrixPerConcurrent?: number;
  rdsCalPerUser?: number;
  windowsSvrPerCore?: number;
  avdComputePerUser?: number;
  nerdioLicense?: number;
  serverHardwarePerServer?: number;   // Annual amortized CapEx per server (~$3,500)
}

// Hypervisor costs for hybrid scenarios (Broadcom/VMware migration)
export interface HypervisorCosts {
  currentAnnualCost: number;         // Current VMware/hypervisor annual cost
  projectedSavingsPercent: number;   // Expected savings % moving to Nutanix/AHV etc.
}

export interface CalculatorInput {
  userCount: number;                  // C19 - RDS CAL count
  concurrencyRate?: number;           // B22 - Default 40%
  mauRate?: number;                   // B23 - Default 50%
  nerdioLicense?: number;             // C25 - Default $8
  includeWindowsServer?: boolean;     // Toggle for full TCO vs software only
  includeNerdio?: boolean;            // Toggle for full TCO
  includeServerHardware?: boolean;    // Include server hardware CapEx (~$3,500/server/year)
  customPricing?: CustomPricing;      // Optional custom pricing overrides
  deploymentMode?: DeploymentMode;    // 'cloud' (default) or 'hybrid'
  hypervisorCosts?: HypervisorCosts;  // Only used in hybrid mode
  advancedConfig?: AdvancedConfig;    // Advanced customization options
}

export interface OnPremCosts {
  citrixLicense: number;              // G14 - Annual
  rdsCalLicense: number;              // G15 - Annual
  windowsServerLicense: number;       // G16 - Annual
  hypervisorCost: number;             // Annual hypervisor cost (hybrid mode)
  totalAnnual: number;
  totalMonthly: number;               // F21
  // Infrastructure costs (user-editable, default to 0)
  serverHardwareSessionHosts?: number;
  serverHardwareCitrixInfra?: number;
  networkLayer?: number;
  powerCooling?: number;
  datacenterRent?: number;
  operationsMaintenance?: number;
  sqlServerLicense?: number;
}

export interface CloudCosts {
  avdCompute: number;                 // F26 - Monthly
  nerdioLicense: number;              // F27 - Monthly
  totalMonthly: number;               // F29
  totalAnnual: number;
  // User-editable costs (default to 0)
  adminOperations?: number;
}

// Hybrid mode: costs that remain after migration
export interface HybridRemainingCosts {
  rdsCalLicense: number;              // Still needed - no multi-session Win11 on hybrid
  windowsServerLicense: number;       // Still needed
  hypervisorCost: number;             // New hypervisor cost (after potential savings)
  nerdioLicense: number;              // Nerdio for management
  totalAnnual: number;
  totalMonthly: number;
}

// Hybrid mode: costs that are removed
export interface HybridSavingsCosts {
  citrixLicense: number;              // Removed - main savings
  hypervisorSavings: number;          // Potential savings from hypervisor change
  totalAnnual: number;
}

export interface Savings {
  percentage: number;                 // F31
  monthlyAmount: number;
  annualAmount: number;
  isCloudCheaper: boolean;            // True if cloud costs less than on-prem
}

export interface CostOfDelay {
  perSecond: number;
  perMinute: number;
  perHour: number;
  perDay: number;
  perMonth: number;
  perYear: number;
}

export interface InfrastructureDetails {
  concurrentUsers: number;            // C22
  mauUsers: number;                   // C23
  sessionHostsNeeded: number;         // C32
  physicalServersNeeded: number;      // C34
}

export interface CalculatorOutput {
  infrastructure: InfrastructureDetails;
  onPrem: OnPremCosts;
  cloud: CloudCosts;
  savings: Savings;
  costOfDelay: CostOfDelay;
  deploymentMode: DeploymentMode;
  // Hybrid-specific data (only populated when deploymentMode === 'hybrid')
  hybrid?: {
    remainingCosts: HybridRemainingCosts;
    savingsCosts: HybridSavingsCosts;
  };
}

export function calculate(input: CalculatorInput): CalculatorOutput {
  const {
    userCount,
    concurrencyRate = DEFAULTS.CONCURRENCY_RATE,
    mauRate = DEFAULTS.MAU_RATE,
    nerdioLicense = PRICING.NERDIO_LICENSE_DEFAULT,
    includeWindowsServer = true,
    includeNerdio = true,
    includeServerHardware = true,       // Default to showing CapEx as conversation starter
    customPricing = {},
    deploymentMode = 'cloud',
    hypervisorCosts,
    advancedConfig = {},
  } = input;

  // Merge advanced config with defaults
  const infraConfig: InfrastructureConfig = {
    ...DEFAULT_INFRASTRUCTURE,
    ...advancedConfig.infrastructure,
  };
  const timeConfig: TimeConfig = {
    ...DEFAULT_TIME_CONFIG,
    ...advancedConfig.timeConfig,
  };
  const formulaOverrides = advancedConfig.formulaOverrides || {};

  // Use custom pricing or defaults
  const citrixRate = customPricing.citrixPerConcurrent ?? PRICING.CITRIX_PER_CONCURRENT;
  const rdsCalRate = customPricing.rdsCalPerUser ?? PRICING.RDS_CAL_PER_USER;
  const windowsRate = customPricing.windowsSvrPerCore ?? PRICING.WINDOWS_SVR_PER_CORE;
  const avdRate = customPricing.avdComputePerUser ?? PRICING.AVD_COMPUTE_PER_USER;
  const nerdioRate = customPricing.nerdioLicense ?? nerdioLicense;
  const serverHardwareRate = customPricing.serverHardwarePerServer ?? PRICING.SERVER_HARDWARE_PER_SERVER;

  // ============================================
  // USER CALCULATIONS (from Victor's sheet)
  // ============================================

  // C22 = C19 * B22 (RDS_CALs × Concurrency_Rate) - or use override
  const concurrentUsers = formulaOverrides.concurrentUsers ?? Math.ceil(userCount * concurrencyRate);

  // C23 = C19 * B23 (RDS_CALs × MAU_Rate)
  const mauUsers = Math.ceil(userCount * mauRate);

  // C32 = C22 / C30 (Concurrent_Users ÷ Users_Per_Host) - or use override
  const sessionHostsNeeded = formulaOverrides.sessionHosts ??
    Math.ceil(concurrentUsers / infraConfig.usersPerHost);

  // C33 = (C32 * C28) / 64 + buffer, then rounded for C34 - or use override
  // (Session_Hosts × Cores) ÷ Server_Cores + buffer
  const physicalServersNeeded = formulaOverrides.physicalServers ?? (
    Math.ceil(
      (sessionHostsNeeded * infraConfig.coresPerHost) / infraConfig.coresPerServer
    ) + infraConfig.serverBuffer
  );

  // ============================================
  // ON-PREM COSTS (Annual)
  // ============================================

  // G14 = J14 * C22 (Citrix rate × Concurrent users)
  const citrixLicense = citrixRate * concurrentUsers;

  // G15 = J15 * C19 (RDS rate × Total users)
  const rdsCalLicense = rdsCalRate * userCount;

  // G16 = J16 * C34 * cores_per_server (Windows rate × Servers × cores)
  const windowsServerLicense = includeWindowsServer
    ? windowsRate * physicalServersNeeded * infraConfig.coresPerServer
    : 0;

  // Server Hardware CapEx - Not included in base calculation; user adds via UI
  // const serverHardwareSessionHosts = includeServerHardware
  //   ? serverHardwareRate * physicalServersNeeded
  //   : 0;

  // Hypervisor cost (for hybrid scenarios)
  const currentHypervisorCost = hypervisorCosts?.currentAnnualCost ?? 0;

  const onPremTotalAnnual = citrixLicense + rdsCalLicense + windowsServerLicense + currentHypervisorCost;
  const onPremTotalMonthly = onPremTotalAnnual / 12;

  // ============================================
  // HYBRID MODE CALCULATIONS
  // ============================================

  if (deploymentMode === 'hybrid') {
    // In hybrid mode:
    // - Citrix license is REMOVED (main savings)
    // - RDS CALs REMAIN (no multi-session Win11 on hybrid)
    // - Windows Server licensing REMAINS
    // - Hypervisor can change (potential savings from Broadcom → Nutanix)
    // - Nerdio is added for management

    const hypervisorSavingsPercent = hypervisorCosts?.projectedSavingsPercent ?? 0;
    const hypervisorSavings = currentHypervisorCost * (hypervisorSavingsPercent / 100);
    const newHypervisorCost = currentHypervisorCost - hypervisorSavings;

    const nerdioLicenseCost = includeNerdio ? nerdioRate * mauUsers : 0;

    // Remaining costs after hybrid migration
    const remainingCosts: HybridRemainingCosts = {
      rdsCalLicense,
      windowsServerLicense,
      hypervisorCost: newHypervisorCost,
      nerdioLicense: nerdioLicenseCost * 12, // Annual
      totalAnnual: rdsCalLicense + windowsServerLicense + newHypervisorCost + (nerdioLicenseCost * 12),
      totalMonthly: (rdsCalLicense + windowsServerLicense + newHypervisorCost + (nerdioLicenseCost * 12)) / 12,
    };

    // Savings from hybrid migration
    const savingsCosts: HybridSavingsCosts = {
      citrixLicense,
      hypervisorSavings,
      totalAnnual: citrixLicense + hypervisorSavings,
    };

    // Net savings = what we remove - what we add (Nerdio)
    const hybridSavingsAnnual = savingsCosts.totalAnnual - (nerdioLicenseCost * 12);
    const hybridSavingsMonthly = hybridSavingsAnnual / 12;
    const hybridSavingsPercentage = onPremTotalAnnual > 0
      ? (hybridSavingsAnnual / onPremTotalAnnual) * 100
      : 0;

    // Cost of delay for hybrid (using timeConfig)
    const costPerMonth = hybridSavingsMonthly;
    const costPerYear = hybridSavingsAnnual;
    const costPerDay = costPerMonth / timeConfig.daysPerMonth;
    const costPerHour = costPerDay / timeConfig.hoursPerDay;
    const costPerMinute = costPerHour / 60;
    const costPerSecond = costPerMinute / 60;

    return {
      infrastructure: {
        concurrentUsers,
        mauUsers,
        sessionHostsNeeded,
        physicalServersNeeded,
      },
      onPrem: {
        citrixLicense,
        rdsCalLicense,
        windowsServerLicense,
        hypervisorCost: currentHypervisorCost,
        totalAnnual: onPremTotalAnnual,
        totalMonthly: onPremTotalMonthly,
        serverHardwareSessionHosts: 0,
      },
      cloud: {
        avdCompute: 0, // No cloud compute in hybrid
        nerdioLicense: nerdioLicenseCost,
        totalMonthly: nerdioLicenseCost,
        totalAnnual: nerdioLicenseCost * 12,
      },
      savings: {
        percentage: hybridSavingsPercentage,
        monthlyAmount: hybridSavingsMonthly,
        annualAmount: hybridSavingsAnnual,
        isCloudCheaper: hybridSavingsAnnual > 0,
      },
      costOfDelay: {
        perSecond: costPerSecond,
        perMinute: costPerMinute,
        perHour: costPerHour,
        perDay: costPerDay,
        perMonth: costPerMonth,
        perYear: costPerYear,
      },
      deploymentMode: 'hybrid',
      hybrid: {
        remainingCosts,
        savingsCosts,
      },
    };
  }

  // ============================================
  // CLOUD MODE CALCULATIONS (existing logic)
  // ============================================

  // F26 = 11 * C22 (AVD rate × Concurrent users)
  const avdCompute = avdRate * concurrentUsers;

  // F27 = C23 * C25 (MAU × Nerdio license cost)
  const nerdioLicenseCost = includeNerdio
    ? nerdioRate * mauUsers
    : 0;

  // F29 = SUM(F26:F27)
  const cloudTotalMonthly = avdCompute + nerdioLicenseCost;
  const cloudTotalAnnual = cloudTotalMonthly * 12;

  // F31 = 1 - (F29 / F21)
  const savingsPercentage = ((onPremTotalAnnual - cloudTotalAnnual) / onPremTotalAnnual) * 100;
  const savingsMonthly = onPremTotalMonthly - cloudTotalMonthly;
  const savingsAnnual = onPremTotalAnnual - cloudTotalAnnual;

  // Cost of delay (using timeConfig)
  const costPerMonth = savingsMonthly;
  const costPerYear = savingsAnnual;
  const costPerDay = costPerMonth / timeConfig.daysPerMonth;
  const costPerHour = costPerDay / timeConfig.hoursPerDay;
  const costPerMinute = costPerHour / 60;
  const costPerSecond = costPerMinute / 60;

  return {
    infrastructure: {
      concurrentUsers,
      mauUsers,
      sessionHostsNeeded,
      physicalServersNeeded,
    },
    onPrem: {
      citrixLicense,
      rdsCalLicense,
      windowsServerLicense,
      hypervisorCost: currentHypervisorCost,
      totalAnnual: onPremTotalAnnual,
      totalMonthly: onPremTotalMonthly,
      serverHardwareSessionHosts: 0,
    },
    cloud: {
      avdCompute,
      nerdioLicense: nerdioLicenseCost,
      totalMonthly: cloudTotalMonthly,
      totalAnnual: cloudTotalAnnual,
    },
    savings: {
      percentage: savingsPercentage,
      monthlyAmount: savingsMonthly,
      annualAmount: savingsAnnual,
      isCloudCheaper: savingsAnnual > 0,
    },
    costOfDelay: {
      perSecond: costPerSecond,
      perMinute: costPerMinute,
      perHour: costPerHour,
      perDay: costPerDay,
      perMonth: costPerMonth,
      perYear: costPerYear,
    },
    deploymentMode: 'cloud',
  };
}

// Line item override keys
export type LineItemOverrides = Record<string, number>;

// On-prem line item keys that contribute to onPrem.totalAnnual
const ON_PREM_LINE_ITEM_KEYS = [
  'citrixLicense', 'rdsCalLicense', 'windowsServerLicense', 'hypervisorCost',
  'serverHardwareSessionHosts', 'serverHardwareCitrixInfra',
  'networkLayer', 'powerCooling', 'datacenterRent', 'operationsMaintenance', 'sqlServerLicense',
] as const;

// Cloud line item keys
const CLOUD_LINE_ITEM_KEYS = ['avdCompute', 'nerdioLicense', 'adminOperations'] as const;

/**
 * Apply user-edited line item overrides to a calculated result.
 * Recalculates totals and savings based on the overridden values.
 */
export function applyLineItemOverrides(
  baseResult: CalculatorOutput,
  overrides: LineItemOverrides,
): CalculatorOutput {
  if (Object.keys(overrides).length === 0) return baseResult;

  const result = structuredClone(baseResult);

  // Apply on-prem overrides
  let onPremTotal = 0;
  for (const key of ON_PREM_LINE_ITEM_KEYS) {
    if (key in overrides) {
      (result.onPrem as unknown as Record<string, number | undefined>)[key] = overrides[key];
    }
    onPremTotal += ((result.onPrem as unknown as Record<string, number | undefined>)[key] as number) ?? 0;
  }
  result.onPrem.totalAnnual = onPremTotal;
  result.onPrem.totalMonthly = onPremTotal / 12;

  // Apply cloud overrides
  let cloudMonthlyItems = 0;
  let cloudAnnualItems = 0;
  for (const key of CLOUD_LINE_ITEM_KEYS) {
    if (key in overrides) {
      (result.cloud as unknown as Record<string, number | undefined>)[key] = overrides[key];
    }
    const val = ((result.cloud as unknown as Record<string, number | undefined>)[key] as number) ?? 0;
    // adminOperations is annual; avdCompute and nerdioLicense are monthly
    if (key === 'adminOperations') {
      cloudAnnualItems += val;
    } else {
      cloudMonthlyItems += val;
    }
  }
  result.cloud.totalMonthly = cloudMonthlyItems;
  result.cloud.totalAnnual = cloudMonthlyItems * 12 + cloudAnnualItems;

  // Recalculate savings
  const savingsAnnual = result.onPrem.totalAnnual - result.cloud.totalAnnual;
  const savingsMonthly = result.onPrem.totalMonthly - result.cloud.totalMonthly;
  const savingsPercentage = result.onPrem.totalAnnual > 0
    ? (savingsAnnual / result.onPrem.totalAnnual) * 100
    : 0;
  result.savings = {
    percentage: savingsPercentage,
    monthlyAmount: savingsMonthly,
    annualAmount: savingsAnnual,
    isCloudCheaper: savingsAnnual > 0,
  };

  // Recalculate cost of delay (match main calculate() which uses DEFAULT_TIME_CONFIG)
  const costPerMonth = savingsMonthly;
  const costPerYear = savingsAnnual;
  const costPerDay = costPerMonth / DEFAULT_TIME_CONFIG.daysPerMonth;
  const costPerHour = costPerDay / DEFAULT_TIME_CONFIG.hoursPerDay;
  result.costOfDelay = {
    perSecond: costPerHour / 3600,
    perMinute: costPerHour / 60,
    perHour: costPerHour,
    perDay: costPerDay,
    perMonth: costPerMonth,
    perYear: costPerYear,
  };

  return result;
}

// Utility function to format currency
export function formatCurrency(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

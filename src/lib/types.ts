// Type definitions for the TCO Calculator

export type DeploymentType = 'on-prem-citrix' | 'cloud-citrix' | 'vmware';

export interface PricingConfig {
  citrixPerConcurrent: number;
  rdsCalPerUser: number;
  windowsSvrPerCore: number;
  avdComputePerUser: number;
  nerdioLicense: number;
  coresPerHost: number;
  memoryGb: number;
  usersPerHost: number;
  coresPerServer: number;
}

export interface AssumptionsConfig {
  concurrencyRate: number;
  mauRate: number;
  includeWindowsServer: boolean;
  includeNerdio: boolean;
}

export interface CalculatorState {
  userCount: number;
  assumptions: AssumptionsConfig;
  pricing: Partial<PricingConfig>;
  isCalculating: boolean;
  showResults: boolean;
  showCostOfDelay: boolean;
}

export interface AnimationState {
  currentStateVisible: boolean;
  futureStateVisible: boolean;
  savingsVisible: boolean;
  costOfDelayVisible: boolean;
}

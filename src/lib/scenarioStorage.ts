'use client';

import { CalculatorOutput } from './calculations';

export interface SavedScenario {
  id: string;
  clientName: string;
  createdAt: string;
  inputs: {
    userCount: number;
    concurrencyRate: number;
    mauRate: number;
    nerdioLicense: number;
    includeWindowsServer: boolean;
    includeNerdio: boolean;
    pricing: {
      citrixPerConcurrent: number;
      rdsCalPerUser: number;
      windowsSvrPerCore: number;
      avdComputePerUser: number;
      nerdioLicense: number;
    };
  };
  result: CalculatorOutput;
}

const STORAGE_KEY = 'tco_saved_scenarios';

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all saved scenarios
export function getSavedScenarios(): SavedScenario[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const scenarios = JSON.parse(data) as SavedScenario[];
    // Sort by date, newest first
    return scenarios.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error reading scenarios:', error);
    return [];
  }
}

export interface SaveResult {
  success: boolean;
  scenario?: SavedScenario;
  error?: string;
}

// Save a new scenario
export function saveScenario(scenario: Omit<SavedScenario, 'id' | 'createdAt'>): SaveResult {
  try {
    const scenarios = getSavedScenarios();

    const newScenario: SavedScenario = {
      ...scenario,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    scenarios.unshift(newScenario);

    // Keep only last 50 scenarios
    const trimmedScenarios = scenarios.slice(0, 50);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedScenarios));

    return { success: true, scenario: newScenario };
  } catch (error) {
    console.error('Error saving scenario:', error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return { success: false, error: 'Storage quota exceeded. Please delete some old scenarios.' };
    }
    return { success: false, error: 'Failed to save scenario. Please try again.' };
  }
}

// Delete a scenario
export function deleteScenario(id: string): void {
  const scenarios = getSavedScenarios();
  const filtered = scenarios.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// Get a single scenario by ID
export function getScenarioById(id: string): SavedScenario | null {
  const scenarios = getSavedScenarios();
  return scenarios.find(s => s.id === id) || null;
}

// Get scenarios by client name
export function getScenariosByClient(clientName: string): SavedScenario[] {
  const scenarios = getSavedScenarios();
  return scenarios.filter(s =>
    s.clientName.toLowerCase().includes(clientName.toLowerCase())
  );
}

// Get unique client names for autocomplete
export function getUniqueClientNames(): string[] {
  const scenarios = getSavedScenarios();
  const names = new Set(scenarios.map(s => s.clientName).filter(Boolean));
  return Array.from(names).sort();
}

// Clear all scenarios
export function clearAllScenarios(): void {
  localStorage.removeItem(STORAGE_KEY);
}

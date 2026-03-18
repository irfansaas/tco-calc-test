'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type Persona = 'SDR' | 'AE' | 'SE' | 'VE';

const PERSONA_STORAGE_KEY = 'tco_calculator_persona';
const ADV_TOGGLE_STORAGE_KEY = 'tco_calculator_adv_toggle';

// View complexity levels
export type ViewLevel = 'simple' | 'standard' | 'full';

export interface PersonaConfig {
  // What each persona can see/edit
  canEditPricing: boolean;
  canEditInfrastructure: boolean;
  canEditFormulas: boolean;
  canSeeAdvancedSettings: boolean;
  showAdvancedToggle: boolean;
  // View configuration
  viewLevel: ViewLevel;
  showCostBreakdown: boolean;           // Show detailed cost line items
  showInfrastructureCosts: boolean;     // Show infrastructure section (servers, network, etc.)
  showSoftwareLicensing: boolean;       // Show software licensing section
  canEditLineItems: boolean;            // Can click to edit individual cost items
  showAssumptionsSliders: boolean;      // Show concurrency/MAU sliders
  showToggleSwitches: boolean;          // Show Windows Server/Nerdio toggles
  showSavedScenarios: boolean;          // Show saved scenarios section
}

const PERSONA_CONFIGS: Record<Persona, PersonaConfig> = {
  SDR: {
    // Permissions
    canEditPricing: false,
    canEditInfrastructure: false,
    canEditFormulas: false,
    canSeeAdvancedSettings: false,
    showAdvancedToggle: false,
    // View: Simple - input users, see cost breakdown with $0 line items as conversation starters
    // SDRs see all line items (even at $0) but cannot edit them - nurtures discovery conversations
    viewLevel: 'simple',
    showCostBreakdown: true,           // Show $0 line items as conversation starters (Victor's ask)
    showInfrastructureCosts: true,     // Show infrastructure section with placeholder values
    showSoftwareLicensing: true,       // Show software section with placeholder values
    canEditLineItems: false,           // Cannot edit - just view for conversation
    showAssumptionsSliders: false,
    showToggleSwitches: false,
    showSavedScenarios: false,
  },
  AE: {
    // Permissions
    canEditPricing: true,
    canEditInfrastructure: false,
    canEditFormulas: false,
    canSeeAdvancedSettings: true,
    showAdvancedToggle: true,
    // View: Standard - see costs but limited editing
    viewLevel: 'standard',
    showCostBreakdown: true,
    showInfrastructureCosts: true,     // AEs can see infrastructure to enable discovery conversations
    showSoftwareLicensing: true,
    canEditLineItems: true,
    showAssumptionsSliders: true,
    showToggleSwitches: true,
    showSavedScenarios: true,
  },
  SE: {
    // Permissions
    canEditPricing: true,
    canEditInfrastructure: true,
    canEditFormulas: true,
    canSeeAdvancedSettings: true,
    showAdvancedToggle: true,
    // View: Standard - see costs, can edit more
    viewLevel: 'standard',
    showCostBreakdown: true,
    showInfrastructureCosts: true,
    showSoftwareLicensing: true,
    canEditLineItems: true,
    showAssumptionsSliders: true,
    showToggleSwitches: true,
    showSavedScenarios: true,
  },
  VE: {
    // Permissions
    canEditPricing: true,
    canEditInfrastructure: true,
    canEditFormulas: true,
    canSeeAdvancedSettings: true,
    showAdvancedToggle: true,
    // View: Full - everything visible and editable
    viewLevel: 'full',
    showCostBreakdown: true,
    showInfrastructureCosts: true,
    showSoftwareLicensing: true,
    canEditLineItems: true,
    showAssumptionsSliders: true,
    showToggleSwitches: true,
    showSavedScenarios: true,
  },
};

const VALID_PERSONAS: Persona[] = ['SDR', 'AE', 'SE', 'VE'];

// External store for persona (syncs with localStorage)
const personaListeners: Set<() => void> = new Set();

function getPersonaSnapshot(): Persona {
  if (typeof window === 'undefined') return 'SDR';
  const saved = localStorage.getItem(PERSONA_STORAGE_KEY);
  if (saved && VALID_PERSONAS.includes(saved as Persona)) {
    return saved as Persona;
  }
  return 'SDR';
}

function getPersonaServerSnapshot(): Persona {
  return 'SDR';
}

function subscribeToPersona(callback: () => void): () => void {
  personaListeners.add(callback);
  return () => personaListeners.delete(callback);
}

// External store for advanced toggle
const advToggleListeners: Set<() => void> = new Set();

function getAdvToggleSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ADV_TOGGLE_STORAGE_KEY) === 'true';
}

function getAdvToggleServerSnapshot(): boolean {
  return false;
}

function subscribeToAdvToggle(callback: () => void): () => void {
  advToggleListeners.add(callback);
  return () => advToggleListeners.delete(callback);
}

export function usePersona() {
  const persona = useSyncExternalStore(
    subscribeToPersona,
    getPersonaSnapshot,
    getPersonaServerSnapshot
  );

  const advToggle = useSyncExternalStore(
    subscribeToAdvToggle,
    getAdvToggleSnapshot,
    getAdvToggleServerSnapshot
  );

  const setPersona = useCallback((newPersona: Persona) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PERSONA_STORAGE_KEY, newPersona);
    }
    personaListeners.forEach(listener => listener());
  }, []);

  const setAdvToggle = useCallback((value: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADV_TOGGLE_STORAGE_KEY, String(value));
    }
    advToggleListeners.forEach(listener => listener());
  }, []);

  const config = PERSONA_CONFIGS[persona];

  // Determine if advanced settings should be shown
  const showAdvancedSettings = config.canSeeAdvancedSettings && (advToggle || !config.showAdvancedToggle);

  // Get persona-specific storage key for isolated data
  const getStorageKey = useCallback((baseKey: string) => {
    return `${baseKey}_${persona.toLowerCase()}`;
  }, [persona]);

  return {
    persona,
    setPersona,
    advToggle,
    setAdvToggle,
    config,
    showAdvancedSettings,
    isInitialized: true,
    getStorageKey,
  };
}

export { PERSONA_CONFIGS };

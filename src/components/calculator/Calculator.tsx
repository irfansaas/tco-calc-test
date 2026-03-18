'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedResultsPanel from './EnhancedResultsPanel';
import PricingPanel, { CustomPricing, defaultPricing } from './PricingPanel';
import SavedScenarios from './SavedScenarios';
import { calculate, CalculatorOutput, DEFAULTS, AdvancedConfig, applyLineItemOverrides, LineItemOverrides } from '@/lib/calculations';
import AdvancedSettingsPanel from './AdvancedSettingsPanel';
import { SavedScenario } from '@/lib/scenarioStorage';
import { exportToPDF } from '@/lib/pdfExport';
import { usePersona } from '@/hooks/usePersona';
import PersonaSelector from '@/components/ui/PersonaSelector';

const SESSION_STORAGE_KEY_BASE = 'tco_calculator_state';

interface SavedState {
  userCount: number;
  clientName: string;
  concurrencyRate: number;
  mauRate: number;
  includeWindowsServer: boolean;
  includeNerdio: boolean;
  pricing: CustomPricing;
  advancedConfig: AdvancedConfig;
}

export default function Calculator() {
  // Persona state
  const { persona, setPersona, advToggle, setAdvToggle, config: personaConfig, showAdvancedSettings, getStorageKey } = usePersona();

  // Input state
  const [userCount, setUserCount] = useState(600);
  const [clientName, setClientName] = useState('');
  const [concurrencyRate, setConcurrencyRate] = useState<number>(DEFAULTS.CONCURRENCY_RATE);
  const [mauRate, setMauRate] = useState<number>(DEFAULTS.MAU_RATE);
  const [includeWindowsServer, setIncludeWindowsServer] = useState(true);
  const [includeNerdio, setIncludeNerdio] = useState(true);
  const [pricing, setPricing] = useState<CustomPricing>(defaultPricing);
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig>({});

  // UI state
  const [baseResult, setBaseResult] = useState<CalculatorOutput | null>(null);
  const [lineItemOverrides, setLineItemOverrides] = useState<LineItemOverrides>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scenarioRefreshTrigger, setScenarioRefreshTrigger] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Derived: apply line item overrides to base result
  const result = baseResult ? applyLineItemOverrides(baseResult, lineItemOverrides) : null;

  // Restore state from sessionStorage on mount and when persona changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = getStorageKey(SESSION_STORAGE_KEY_BASE);
    try {
      const savedState = sessionStorage.getItem(storageKey);
      if (savedState) {
        const state: SavedState = JSON.parse(savedState);
        // Intentional state hydration from storage - these setState calls are necessary
        // to restore persisted user input on page reload
        /* eslint-disable react-hooks/set-state-in-effect */
        setUserCount(state.userCount);
        setClientName(state.clientName);
        setConcurrencyRate(state.concurrencyRate);
        setMauRate(state.mauRate);
        setIncludeWindowsServer(state.includeWindowsServer);
        setIncludeNerdio(state.includeNerdio);
        setPricing(state.pricing);
        if (state.advancedConfig) setAdvancedConfig(state.advancedConfig);
        /* eslint-enable react-hooks/set-state-in-effect */
      } else {
        // Reset to defaults when switching to a persona with no saved data
        setUserCount(600);
        setClientName('');
        setConcurrencyRate(DEFAULTS.CONCURRENCY_RATE);
        setMauRate(DEFAULTS.MAU_RATE);
        setIncludeWindowsServer(true);
        setIncludeNerdio(true);
        setPricing(defaultPricing);
        setAdvancedConfig({});
      }
      // Reset results when persona changes
      setShowResults(false);
      setBaseResult(null);
      setLineItemOverrides({});
    } catch (error) {
      console.error('Error restoring state:', error);
    }
    setIsInitialized(true);
  }, [persona, getStorageKey]);

  // Save state to sessionStorage when inputs change (persona-specific)
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    const storageKey = getStorageKey(SESSION_STORAGE_KEY_BASE);
    const state: SavedState = {
      userCount,
      clientName,
      concurrencyRate,
      mauRate,
      includeWindowsServer,
      includeNerdio,
      pricing,
      advancedConfig,
    };

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [userCount, clientName, concurrencyRate, mauRate, includeWindowsServer, includeNerdio, pricing, advancedConfig, isInitialized, getStorageKey]);

  // Load a saved scenario
  const handleLoadScenario = useCallback((scenario: SavedScenario) => {
    setUserCount(scenario.inputs.userCount);
    setClientName(scenario.clientName);
    setConcurrencyRate(scenario.inputs.concurrencyRate);
    setMauRate(scenario.inputs.mauRate);
    setIncludeWindowsServer(scenario.inputs.includeWindowsServer);
    setIncludeNerdio(scenario.inputs.includeNerdio);
    setPricing(scenario.inputs.pricing);
    setBaseResult(scenario.result);
    setLineItemOverrides({});
    setShowResults(true);
  }, []);

  // Regenerate PDF for a saved scenario
  const handleRegeneratePDF = useCallback(async (scenario: SavedScenario) => {
    await exportToPDF('results-container', {
      clientName: scenario.clientName,
      userCount: scenario.inputs.userCount,
      result: scenario.result,
      generatedAt: new Date(),
      pricing: scenario.inputs.pricing,
    });
  }, []);

  // Called when a new scenario is saved
  const handleScenarioSaved = useCallback(() => {
    setScenarioRefreshTrigger(prev => prev + 1);
  }, []);

  const handleLineItemChange = useCallback((key: string, value: number) => {
    setLineItemOverrides(prev => ({ ...prev, [key]: value }));
  }, []);

  const runCalculation = useCallback(() => {
    if (userCount < 10) return;

    setIsCalculating(true);
    setLineItemOverrides({});
    setTimeout(() => {
      const calculatedResult = calculate({
        userCount,
        concurrencyRate,
        mauRate,
        nerdioLicense: pricing.nerdioLicense,
        includeWindowsServer,
        includeNerdio,
        customPricing: pricing,
        advancedConfig,
      });
      setBaseResult(calculatedResult);
      setIsCalculating(false);
      setShowResults(true);
    }, 300);
  }, [userCount, concurrencyRate, mauRate, pricing, includeWindowsServer, includeNerdio, advancedConfig]);

  const resetCalculator = useCallback(() => {
    setShowResults(false);
    setBaseResult(null);
    setLineItemOverrides({});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-lg">N</span>
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-gray-900">TCO Calculator</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Enhanced Mode</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <PersonaSelector persona={persona} onPersonaChange={setPersona} />
              {personaConfig.showAdvancedToggle && (
                <label className="flex items-center gap-1 cursor-pointer" title="Show Advanced Settings">
                  <input
                    type="checkbox"
                    checked={advToggle}
                    onChange={(e) => setAdvToggle(e.target.checked)}
                    className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500">adv</span>
                </label>
              )}
              <a
                href="/simple"
                className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                Simple
              </a>
              {showResults && (
                <button
                  onClick={resetCalculator}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← New
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {/* Hero Section */}
              <div className="text-center mb-4 sm:mb-8 max-w-2xl px-2">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4"
                >
                  Citrix to AVD TCO Calculator
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-sm sm:text-lg text-gray-600"
                >
                  Calculate your potential savings with full infrastructure visibility
                </motion.p>
              </div>

              {/* Main Input Card */}
              <div className="w-full max-w-xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Client Name Input - MANDATORY */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client / Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal ${
                      clientName.trim() === '' ? 'border-gray-300' : 'border-green-400'
                    }`}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Required - Will appear on the report and PDF export
                  </p>
                </div>

                {/* User Count Input */}
                <div>
                  <label htmlFor="user-count" className="block text-sm font-medium text-gray-700 mb-2">
                    How many Citrix users do you have?
                  </label>
                  <input
                    id="user-count"
                    type="number"
                    value={userCount || ''}
                    onChange={(e) => setUserCount(parseInt(e.target.value) || 0)}
                    placeholder="e.g., 600"
                    min={10}
                    max={100000}
                    aria-label="Number of Citrix users"
                    aria-describedby="user-count-hint user-count-error"
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-2xl sm:text-3xl font-bold text-center border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 placeholder:font-normal ${
                      userCount > 0 && userCount < 10 ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  <p id="user-count-hint" className="text-center text-xs sm:text-sm text-gray-400 mt-2">
                    Total RDS CAL / user count
                  </p>
                  {userCount > 0 && userCount < 10 && (
                    <p id="user-count-error" className="text-center text-xs text-red-500 mt-1" role="alert">
                      Minimum 10 users required for accurate calculations
                    </p>
                  )}
                </div>

                {/* Assumptions Section - Only for AE/SE/VE */}
                {personaConfig.showAssumptionsSliders && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Assumptions</p>

                    {/* Concurrency Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="concurrency-rate" className="text-sm text-gray-600">Concurrency Rate</label>
                        <span className="text-sm font-semibold">{(concurrencyRate * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        id="concurrency-rate"
                        type="range"
                        min={10}
                        max={100}
                        value={concurrencyRate * 100}
                        onChange={(e) => setConcurrencyRate(parseInt(e.target.value) / 100)}
                        aria-label={`Concurrency rate: ${(concurrencyRate * 100).toFixed(0)}%`}
                        aria-valuemin={10}
                        aria-valuemax={100}
                        aria-valuenow={concurrencyRate * 100}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    {/* MAU Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="mau-rate" className="text-sm text-gray-600">Monthly Active Users</label>
                        <span className="text-sm font-semibold">{(mauRate * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        id="mau-rate"
                        type="range"
                        min={10}
                        max={100}
                        value={mauRate * 100}
                        onChange={(e) => setMauRate(parseInt(e.target.value) / 100)}
                        aria-label={`Monthly active users rate: ${(mauRate * 100).toFixed(0)}%`}
                        aria-valuemin={10}
                        aria-valuemax={100}
                        aria-valuenow={mauRate * 100}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      {concurrencyRate > mauRate && (
                        <p className="text-xs text-amber-600 mt-1" role="alert">
                          Note: Concurrency rate typically should not exceed MAU rate
                        </p>
                      )}
                    </div>

                    {/* Toggle Switches - Only for AE/SE/VE */}
                    {personaConfig.showToggleSwitches && (
                      <div className="flex flex-col space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="include-windows" className="text-sm text-gray-600 cursor-pointer">
                            Include Windows Server costs
                          </label>
                          <button
                            id="include-windows"
                            type="button"
                            role="switch"
                            aria-checked={includeWindowsServer}
                            onClick={() => setIncludeWindowsServer(!includeWindowsServer)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIncludeWindowsServer(!includeWindowsServer);
                              }
                            }}
                            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              includeWindowsServer ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                includeWindowsServer ? 'translate-x-5' : ''
                              }`}
                            />
                            <span className="sr-only">Include Windows Server costs</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <label htmlFor="include-nerdio" className="text-sm text-gray-600 cursor-pointer">
                            Include Nerdio license
                          </label>
                          <button
                            id="include-nerdio"
                            type="button"
                            role="switch"
                            aria-checked={includeNerdio}
                            onClick={() => setIncludeNerdio(!includeNerdio)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIncludeNerdio(!includeNerdio);
                              }
                            }}
                            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              includeNerdio ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                includeNerdio ? 'translate-x-5' : ''
                              }`}
                            />
                            <span className="sr-only">Include Nerdio license</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Customization - Only for AE, SE, VE */}
                {personaConfig.canEditPricing && (
                  <PricingPanel pricing={pricing} onPricingChange={setPricing} />
                )}

                {/* Advanced Settings - Based on persona and adv toggle */}
                {showAdvancedSettings && (
                  <AdvancedSettingsPanel
                    config={advancedConfig}
                    onConfigChange={setAdvancedConfig}
                    personaConfig={personaConfig}
                  />
                )}

                {/* Calculate Button */}
                <button
                  onClick={runCalculation}
                  disabled={userCount < 10 || isCalculating || clientName.trim() === ''}
                  className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {isCalculating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating...
                    </>
                  ) : (
                    'Generate TCO Analysis →'
                  )}
                </button>
              </div>

              {/* Saved Scenarios - Only for AE/SE/VE */}
              {personaConfig.showSavedScenarios && (
                <div className="w-full max-w-xl mx-auto mt-6">
                  <SavedScenarios
                    onLoadScenario={handleLoadScenario}
                    onRegeneratePDF={handleRegeneratePDF}
                    refreshTrigger={scenarioRefreshTrigger}
                  />
                </div>
              )}

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 sm:mt-8 text-center px-4"
              >
                <p className="text-xs sm:text-sm text-gray-500">
                  Trusted by enterprises worldwide for Citrix migrations
                </p>
                <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4 opacity-50">
                  <span className="text-gray-400 text-[10px] sm:text-xs">Enterprise Ready</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs hidden sm:inline">•</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs">Microsoft Partner</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs hidden sm:inline">•</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs">SOC 2 Compliant</span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {result && (
                <EnhancedResultsPanel
                  result={result}
                  userCount={userCount}
                  clientName={clientName}
                  pricing={pricing}
                  concurrencyRate={concurrencyRate}
                  mauRate={mauRate}
                  includeWindowsServer={includeWindowsServer}
                  includeNerdio={includeNerdio}
                  onScenarioSaved={handleScenarioSaved}
                  onLineItemChange={handleLineItemChange}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-gray-500">
              Calculations are estimates based on typical deployment scenarios
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

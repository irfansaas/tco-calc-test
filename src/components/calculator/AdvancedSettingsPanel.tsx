'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AdvancedConfig,
  InfrastructureConfig,
  BusinessHoursConfig,
  TimeConfig,
  FormulaOverrides,
  PDFConfig,
  VisualizationConfig,
  DEFAULT_INFRASTRUCTURE,
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_TIME_CONFIG,
  DEFAULT_PDF_CONFIG,
  DEFAULT_VISUALIZATION,
} from '@/lib/calculations';
import { Settings, ChevronDown, ChevronUp, Server, Clock, Calculator, FileText, Eye, RotateCcw, LucideIcon } from 'lucide-react';
import { PersonaConfig } from '@/hooks/usePersona';

interface AdvancedSettingsPanelProps {
  config: AdvancedConfig;
  onConfigChange: (config: AdvancedConfig) => void;
  personaConfig: PersonaConfig;
}

type SectionId = 'infrastructure' | 'businessHours' | 'timeConfig' | 'formulas' | 'pdf' | 'visualization';

// Extracted to avoid creating components during render
interface SectionHeaderProps {
  id: SectionId;
  icon: LucideIcon;
  title: string;
  description: string;
  isExpanded: boolean;
  onToggle: (id: SectionId) => void;
}

function SectionHeader({ id, icon: Icon, title, description, isExpanded, onToggle }: SectionHeaderProps) {
  return (
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );
}

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (val: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}

function NumberInput({ label, value, onChange, min, max, step = 1, unit, placeholder }: NumberInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-600">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AdvancedSettingsPanel({ config, onConfigChange, personaConfig }: AdvancedSettingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set());

  const toggleSection = (section: SectionId) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  // Merge with defaults for display
  const infraConfig: InfrastructureConfig = { ...DEFAULT_INFRASTRUCTURE, ...config.infrastructure };
  const businessHours: BusinessHoursConfig = { ...DEFAULT_BUSINESS_HOURS, ...config.businessHours };
  const timeConfig: TimeConfig = { ...DEFAULT_TIME_CONFIG, ...config.timeConfig };
  const formulaOverrides: FormulaOverrides = config.formulaOverrides || {};
  const pdfConfig: PDFConfig = { ...DEFAULT_PDF_CONFIG, ...config.pdfConfig };
  const vizConfig: VisualizationConfig = { ...DEFAULT_VISUALIZATION, ...config.visualization };

  const updateInfrastructure = (updates: Partial<InfrastructureConfig>) => {
    onConfigChange({
      ...config,
      infrastructure: { ...infraConfig, ...updates },
    });
  };

  const updateBusinessHours = (updates: Partial<BusinessHoursConfig>) => {
    onConfigChange({
      ...config,
      businessHours: { ...businessHours, ...updates },
    });
  };

  const updateTimeConfig = (updates: Partial<TimeConfig>) => {
    onConfigChange({
      ...config,
      timeConfig: { ...timeConfig, ...updates },
    });
  };

  const updateFormulaOverrides = (updates: Partial<FormulaOverrides>) => {
    onConfigChange({
      ...config,
      formulaOverrides: { ...formulaOverrides, ...updates },
    });
  };

  const updatePdfConfig = (updates: Partial<PDFConfig>) => {
    onConfigChange({
      ...config,
      pdfConfig: { ...pdfConfig, ...updates },
    });
  };

  const updateVisualization = (updates: Partial<VisualizationConfig>) => {
    onConfigChange({
      ...config,
      visualization: { ...vizConfig, ...updates },
    });
  };

  const resetToDefaults = () => {
    onConfigChange({});
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Advanced Settings</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2 bg-gray-50 rounded-xl p-4">
              {/* Reset Button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={resetToDefaults}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Defaults
                </button>
              </div>

              {/* Infrastructure Section - Only for SE/VE */}
              {personaConfig.canEditInfrastructure && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <SectionHeader
                    id="infrastructure"
                    icon={Server}
                    title="Infrastructure Parameters"
                    description="VM sizing and server configuration"
                    isExpanded={expandedSections.has('infrastructure')}
                    onToggle={toggleSection}
                  />
                  <AnimatePresence>
                    {expandedSections.has('infrastructure') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 pb-3 space-y-3"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <NumberInput
                            label="Users per Session Host"
                            value={infraConfig.usersPerHost}
                            onChange={(v) => updateInfrastructure({ usersPerHost: v || DEFAULT_INFRASTRUCTURE.usersPerHost })}
                            min={1}
                            max={64}
                            placeholder="16"
                          />
                          <NumberInput
                            label="Cores per Session Host"
                            value={infraConfig.coresPerHost}
                            onChange={(v) => updateInfrastructure({ coresPerHost: v || DEFAULT_INFRASTRUCTURE.coresPerHost })}
                            min={2}
                            max={128}
                            placeholder="8"
                          />
                          <NumberInput
                            label="Memory per Host"
                            value={infraConfig.memoryPerHost}
                            onChange={(v) => updateInfrastructure({ memoryPerHost: v || DEFAULT_INFRASTRUCTURE.memoryPerHost })}
                            min={4}
                            max={512}
                            unit="GB"
                            placeholder="32"
                          />
                          <NumberInput
                            label="Cores per Physical Server"
                            value={infraConfig.coresPerServer}
                            onChange={(v) => updateInfrastructure({ coresPerServer: v || DEFAULT_INFRASTRUCTURE.coresPerServer })}
                            min={8}
                            max={256}
                            placeholder="64"
                          />
                          <NumberInput
                            label="Server Buffer (Redundancy)"
                            value={infraConfig.serverBuffer}
                            onChange={(v) => updateInfrastructure({ serverBuffer: v ?? DEFAULT_INFRASTRUCTURE.serverBuffer })}
                            min={0}
                            max={10}
                            placeholder="1"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          These values affect infrastructure sizing calculations.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Business Hours Section */}
              <div className="bg-white rounded-lg border border-gray-200">
                <SectionHeader
                  id="businessHours"
                  icon={Clock}
                  title="Business Hours"
                  description="Operating schedule for AVD compute costs"
                  isExpanded={expandedSections.has('businessHours')}
                  onToggle={toggleSection}
                />
                <AnimatePresence>
                  {expandedSections.has('businessHours') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 pb-3 space-y-3"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        <NumberInput
                          label="Hours per Day"
                          value={businessHours.hoursPerDay}
                          onChange={(v) => updateBusinessHours({ hoursPerDay: v || DEFAULT_BUSINESS_HOURS.hoursPerDay })}
                          min={1}
                          max={24}
                          step={0.5}
                          unit="hrs"
                          placeholder="8.5"
                        />
                        <NumberInput
                          label="Days per Week"
                          value={businessHours.daysPerWeek}
                          onChange={(v) => updateBusinessHours({ daysPerWeek: v || DEFAULT_BUSINESS_HOURS.daysPerWeek })}
                          min={1}
                          max={7}
                          placeholder="5"
                        />
                        <NumberInput
                          label="Weeks per Year"
                          value={businessHours.weeksPerYear}
                          onChange={(v) => updateBusinessHours({ weeksPerYear: v || DEFAULT_BUSINESS_HOURS.weeksPerYear })}
                          min={1}
                          max={52}
                          placeholder="52"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Default assumes 08:00-16:30 (8.5 hours), Mon-Fri, 52 weeks.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time Configuration Section */}
              <div className="bg-white rounded-lg border border-gray-200">
                <SectionHeader
                  id="timeConfig"
                  icon={Clock}
                  title="Time Period Settings"
                  description="For cost of delay calculations"
                  isExpanded={expandedSections.has('timeConfig')}
                  onToggle={toggleSection}
                />
                <AnimatePresence>
                  {expandedSections.has('timeConfig') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 pb-3 space-y-3"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        <NumberInput
                          label="Days per Month"
                          value={timeConfig.daysPerMonth}
                          onChange={(v) => updateTimeConfig({ daysPerMonth: v || DEFAULT_TIME_CONFIG.daysPerMonth })}
                          min={28}
                          max={31}
                          placeholder="30"
                        />
                        <NumberInput
                          label="Hours per Day"
                          value={timeConfig.hoursPerDay}
                          onChange={(v) => updateTimeConfig({ hoursPerDay: v || DEFAULT_TIME_CONFIG.hoursPerDay })}
                          min={1}
                          max={24}
                          placeholder="24"
                        />
                        <NumberInput
                          label="Months per Year"
                          value={timeConfig.monthsPerYear}
                          onChange={(v) => updateTimeConfig({ monthsPerYear: v || DEFAULT_TIME_CONFIG.monthsPerYear })}
                          min={12}
                          max={13}
                          placeholder="12"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        These affect cost of delay breakdown calculations.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Formula Overrides Section - Only for SE/VE */}
              {personaConfig.canEditFormulas && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <SectionHeader
                    id="formulas"
                    icon={Calculator}
                    title="Formula Overrides"
                    description="Bypass calculated values with direct inputs"
                    isExpanded={expandedSections.has('formulas')}
                    onToggle={toggleSection}
                  />
                  <AnimatePresence>
                    {expandedSections.has('formulas') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 pb-3 space-y-3"
                      >
                        <div className="grid grid-cols-3 gap-3">
                          <NumberInput
                            label="Concurrent Users"
                            value={formulaOverrides.concurrentUsers}
                            onChange={(v) => updateFormulaOverrides({ concurrentUsers: v })}
                            min={1}
                            placeholder="Auto"
                          />
                          <NumberInput
                            label="Session Hosts"
                            value={formulaOverrides.sessionHosts}
                            onChange={(v) => updateFormulaOverrides({ sessionHosts: v })}
                            min={1}
                            placeholder="Auto"
                          />
                          <NumberInput
                            label="Physical Servers"
                            value={formulaOverrides.physicalServers}
                            onChange={(v) => updateFormulaOverrides({ physicalServers: v })}
                            min={1}
                            placeholder="Auto"
                          />
                        </div>
                        <p className="text-xs text-amber-600">
                          Leave empty to use calculated values. Use these to override with known values.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* PDF Configuration Section */}
              <div className="bg-white rounded-lg border border-gray-200">
                <SectionHeader
                  id="pdf"
                  icon={FileText}
                  title="PDF Export"
                  description="Customize PDF report output"
                  isExpanded={expandedSections.has('pdf')}
                  onToggle={toggleSection}
                />
                <AnimatePresence>
                  {expandedSections.has('pdf') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 pb-3 space-y-3"
                    >
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-600">Footer Text</label>
                          <input
                            type="text"
                            value={pdfConfig.footerText}
                            onChange={(e) => updatePdfConfig({ footerText: e.target.value })}
                            placeholder="Created by Value Engineering"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
                          />
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pdfConfig.includeTimestamp}
                              onChange={(e) => updatePdfConfig({ includeTimestamp: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-700">Include timestamp</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pdfConfig.includeAssumptions}
                              onChange={(e) => updatePdfConfig({ includeAssumptions: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-700">Include assumptions</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pdfConfig.includeCostOfDelay}
                              onChange={(e) => updatePdfConfig({ includeCostOfDelay: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-700">Include cost of delay</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Visualization Section */}
              <div className="bg-white rounded-lg border border-gray-200">
                <SectionHeader
                  id="visualization"
                  icon={Eye}
                  title="Visualization Limits"
                  description="Control diagram display settings"
                  isExpanded={expandedSections.has('visualization')}
                  onToggle={toggleSection}
                />
                <AnimatePresence>
                  {expandedSections.has('visualization') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 pb-3 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <NumberInput
                          label="Max Servers Shown"
                          value={vizConfig.maxServersShown}
                          onChange={(v) => updateVisualization({ maxServersShown: v || DEFAULT_VISUALIZATION.maxServersShown })}
                          min={1}
                          max={20}
                          placeholder="6"
                        />
                        <NumberInput
                          label="Max VMs Shown"
                          value={vizConfig.maxVMsShown}
                          onChange={(v) => updateVisualization({ maxVMsShown: v || DEFAULT_VISUALIZATION.maxVMsShown })}
                          min={1}
                          max={20}
                          placeholder="8"
                        />
                        <NumberInput
                          label="Max User Avatars"
                          value={vizConfig.maxUsersShown}
                          onChange={(v) => updateVisualization({ maxUsersShown: v || DEFAULT_VISUALIZATION.maxUsersShown })}
                          min={1}
                          max={20}
                          placeholder="6"
                        />
                        <NumberInput
                          label="Users per Avatar"
                          value={vizConfig.usersPerAvatar}
                          onChange={(v) => updateVisualization({ usersPerAvatar: v || DEFAULT_VISUALIZATION.usersPerAvatar })}
                          min={10}
                          max={1000}
                          placeholder="100"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Controls how many icons are displayed in architecture diagrams.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export default config for external use
export const getDefaultAdvancedConfig = (): AdvancedConfig => ({
  infrastructure: DEFAULT_INFRASTRUCTURE,
  businessHours: DEFAULT_BUSINESS_HOURS,
  timeConfig: DEFAULT_TIME_CONFIG,
  pdfConfig: DEFAULT_PDF_CONFIG,
  visualization: DEFAULT_VISUALIZATION,
});

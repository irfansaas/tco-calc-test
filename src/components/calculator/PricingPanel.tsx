'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon, DollarIcon } from '@/components/icons';
import { PRICING } from '@/lib/calculations';

export interface CustomPricing {
  citrixPerConcurrent: number;
  rdsCalPerUser: number;
  windowsSvrPerCore: number;
  avdComputePerUser: number;
  nerdioLicense: number;
}

interface PricingPanelProps {
  pricing: CustomPricing;
  onPricingChange: (pricing: CustomPricing) => void;
}

const defaultPricing: CustomPricing = {
  citrixPerConcurrent: PRICING.CITRIX_PER_CONCURRENT,
  rdsCalPerUser: PRICING.RDS_CAL_PER_USER,
  windowsSvrPerCore: PRICING.WINDOWS_SVR_PER_CORE,
  avdComputePerUser: PRICING.AVD_COMPUTE_PER_USER,
  nerdioLicense: PRICING.NERDIO_LICENSE_DEFAULT,
};

export default function PricingPanel({ pricing, onPricingChange }: PricingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [manualInputMode, setManualInputMode] = useState(false);

  const handleChange = (field: keyof CustomPricing, value: string) => {
    const numValue = parseFloat(value) || 0;
    onPricingChange({
      ...pricing,
      [field]: numValue,
    });
  };

  const resetToDefaults = () => {
    onPricingChange(defaultPricing);
  };

  const pricingFields = [
    {
      key: 'citrixPerConcurrent' as keyof CustomPricing,
      label: 'Citrix License',
      unit: '/user/year',
      description: 'Per concurrent user, annual',
      min: 50,
      max: 500,
      step: 1,
      absoluteMax: 10000,
    },
    {
      key: 'rdsCalPerUser' as keyof CustomPricing,
      label: 'RDS CAL',
      unit: '/user/year',
      description: 'Per user, annual',
      min: 20,
      max: 150,
      step: 1,
      absoluteMax: 1000,
    },
    {
      key: 'windowsSvrPerCore' as keyof CustomPricing,
      label: 'Windows Server',
      unit: '/core/year',
      description: 'Datacenter license per core',
      min: 50,
      max: 300,
      step: 1,
      absoluteMax: 2000,
    },
    {
      key: 'avdComputePerUser' as keyof CustomPricing,
      label: 'AVD Compute',
      unit: '/user/month',
      description: 'Azure compute cost per user',
      min: 5,
      max: 50,
      step: 1,
      absoluteMax: 500,
    },
    {
      key: 'nerdioLicense' as keyof CustomPricing,
      label: 'Nerdio License',
      unit: '/MAU/month',
      description: 'Per monthly active user',
      min: 1,
      max: 20,
      step: 1,
      absoluteMax: 100,
    },
  ];

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <DollarIcon size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">Customize Pricing</span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon size={16} className="text-gray-500 sm:w-[18px] sm:h-[18px]" />
        ) : (
          <ChevronDownIcon size={16} className="text-gray-500 sm:w-[18px] sm:h-[18px]" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">Adjust pricing assumptions</p>
                  <button
                    onClick={() => setManualInputMode(!manualInputMode)}
                    className={`text-[10px] sm:text-xs px-2 py-0.5 rounded transition-colors ${
                      manualInputMode
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {manualInputMode ? 'Manual Input' : 'Slider Mode'}
                  </button>
                </div>
                <button
                  onClick={resetToDefaults}
                  className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700"
                >
                  Reset to defaults
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {pricingFields.map((field) => (
                  <div key={field.key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      {!manualInputMode && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            ${pricing[field.key].toFixed(2)}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500">{field.unit}</span>
                        </div>
                      )}
                    </div>
                    {manualInputMode ? (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            min={0}
                            max={field.absoluteMax}
                            step={field.step}
                            value={pricing[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
                            placeholder={`${field.min}-${field.absoluteMax}`}
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{field.unit}</span>
                      </div>
                    ) : (
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={Math.min(pricing[field.key], field.max)}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    )}
                    <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                      <p className="text-[9px] sm:text-[10px] text-gray-400">{field.description}</p>
                      {!manualInputMode && pricing[field.key] > field.max && (
                        <span className="text-[9px] text-amber-600">
                          Value exceeds slider range
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <p className="text-[9px] sm:text-[10px] text-gray-400">
                  {manualInputMode
                    ? 'Manual input mode: Enter any value for custom enterprise pricing.'
                    : 'Default pricing based on enterprise customer data. Use Manual Input for values outside slider range.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { defaultPricing };

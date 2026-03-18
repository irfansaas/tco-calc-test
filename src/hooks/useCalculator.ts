'use client';

import { useState, useCallback } from 'react';
import { calculate, CalculatorOutput, DEFAULTS, PRICING } from '@/lib/calculations';

export interface CalculatorInputState {
  userCount: number;
  concurrencyRate: number;
  mauRate: number;
  nerdioLicense: number;
  includeWindowsServer: boolean;
  includeNerdio: boolean;
}

export interface UseCalculatorReturn {
  input: CalculatorInputState;
  result: CalculatorOutput | null;
  isCalculating: boolean;
  showResults: boolean;
  updateUserCount: (count: number) => void;
  updateConcurrencyRate: (rate: number) => void;
  updateMauRate: (rate: number) => void;
  updateNerdioLicense: (cost: number) => void;
  toggleWindowsServer: () => void;
  toggleNerdio: () => void;
  runCalculation: () => void;
  resetCalculator: () => void;
}

const initialInput: CalculatorInputState = {
  userCount: 600,
  concurrencyRate: DEFAULTS.CONCURRENCY_RATE,
  mauRate: DEFAULTS.MAU_RATE,
  nerdioLicense: PRICING.NERDIO_LICENSE_DEFAULT,
  includeWindowsServer: true,
  includeNerdio: true,
};

export function useCalculator(): UseCalculatorReturn {
  const [input, setInput] = useState<CalculatorInputState>(initialInput);
  const [result, setResult] = useState<CalculatorOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const updateUserCount = useCallback((count: number) => {
    setInput((prev) => ({ ...prev, userCount: Math.max(10, Math.min(100000, count)) }));
  }, []);

  const updateConcurrencyRate = useCallback((rate: number) => {
    setInput((prev) => ({ ...prev, concurrencyRate: Math.max(0.1, Math.min(1, rate)) }));
  }, []);

  const updateMauRate = useCallback((rate: number) => {
    setInput((prev) => ({ ...prev, mauRate: Math.max(0.1, Math.min(1, rate)) }));
  }, []);

  const updateNerdioLicense = useCallback((cost: number) => {
    setInput((prev) => ({ ...prev, nerdioLicense: Math.max(1, Math.min(50, cost)) }));
  }, []);

  const toggleWindowsServer = useCallback(() => {
    setInput((prev) => ({ ...prev, includeWindowsServer: !prev.includeWindowsServer }));
  }, []);

  const toggleNerdio = useCallback(() => {
    setInput((prev) => ({ ...prev, includeNerdio: !prev.includeNerdio }));
  }, []);

  const runCalculation = useCallback(() => {
    setIsCalculating(true);
    setShowResults(false);

    // Simulate a brief calculation delay for animation purposes
    setTimeout(() => {
      const calculatedResult = calculate({
        userCount: input.userCount,
        concurrencyRate: input.concurrencyRate,
        mauRate: input.mauRate,
        nerdioLicense: input.nerdioLicense,
        includeWindowsServer: input.includeWindowsServer,
        includeNerdio: input.includeNerdio,
      });
      setResult(calculatedResult);
      setIsCalculating(false);
      setShowResults(true);
    }, 300);
  }, [input]);

  const resetCalculator = useCallback(() => {
    setInput(initialInput);
    setResult(null);
    setShowResults(false);
    setIsCalculating(false);
  }, []);

  return {
    input,
    result,
    isCalculating,
    showResults,
    updateUserCount,
    updateConcurrencyRate,
    updateMauRate,
    updateNerdioLicense,
    toggleWindowsServer,
    toggleNerdio,
    runCalculation,
    resetCalculator,
  };
}

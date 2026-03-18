'use client';

import { useState, useEffect, useCallback } from 'react';
import { CostOfDelay } from '@/lib/calculations';

export interface UseCostOfDelayReturn {
  secondsElapsed: number;
  moneyLost: number;
  isActive: boolean;
  startCounter: () => void;
  stopCounter: () => void;
  resetCounter: () => void;
}

export function useCostOfDelay(costOfDelay: CostOfDelay | null): UseCostOfDelayReturn {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && costOfDelay) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, costOfDelay]);

  const moneyLost = costOfDelay ? secondsElapsed * costOfDelay.perSecond : 0;

  const startCounter = useCallback(() => {
    setIsActive(true);
  }, []);

  const stopCounter = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetCounter = useCallback(() => {
    setSecondsElapsed(0);
    setIsActive(false);
  }, []);

  return {
    secondsElapsed,
    moneyLost,
    isActive,
    startCounter,
    stopCounter,
    resetCounter,
  };
}

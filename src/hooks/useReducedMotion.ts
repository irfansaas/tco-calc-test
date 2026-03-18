'use client';

import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Initialize from media query on mount
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

// Animation variants that respect reduced motion
export const reducedMotionVariants = {
  initial: (reducedMotion: boolean) => ({
    opacity: reducedMotion ? 1 : 0,
    y: reducedMotion ? 0 : 20,
  }),
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: (reducedMotion: boolean) => ({
    opacity: reducedMotion ? 1 : 0,
    y: reducedMotion ? 0 : -20,
  }),
};

// Transition that respects reduced motion
export const getTransition = (reducedMotion: boolean, duration = 0.3) => ({
  duration: reducedMotion ? 0 : duration,
});

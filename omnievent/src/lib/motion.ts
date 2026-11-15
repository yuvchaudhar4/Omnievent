import { useEffect, useState } from 'react';
import type { Variants, Transition } from 'framer-motion';

// ── Animation Token Constants ──────────────────────────────────────────────────

export const durations = {
  fast: 0.15,
  standard: 0.3,
  emphasized: 0.5,
} as const;

export const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 24,
  mass: 0.8,
};

export const pageEntranceTransition: Transition = {
  duration: durations.emphasized,
  ease: [0.22, 1, 0.36, 1],
};

export const staggerTransition = {
  staggerChildren: 0.07,
  delayChildren: 0.1,
};

// ── Framer Motion Variants ─────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.standard } },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.standard, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: durations.fast } },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.standard, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 12, transition: { duration: durations.fast } },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: durations.standard, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -12, transition: { duration: durations.fast } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: durations.standard, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 12, transition: { duration: durations.fast } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: durations.standard, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: durations.fast } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: staggerTransition,
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.standard, ease: [0.22, 1, 0.36, 1] },
  },
};

export const pageEntrance: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: pageEntranceTransition,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: durations.fast },
  },
};

export const modalEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...springConfig, stiffness: 400, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: durations.fast },
  },
};

export const springBounce: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: durations.fast },
  },
};

// ── Reduced Motion Variants ────────────────────────────────────────────────────

const reducedFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.fast } },
  exit: { opacity: 0, transition: { duration: durations.fast } },
};

// ── useReducedMotion Hook ──────────────────────────────────────────────────────

export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /** Return the reduced-motion safe variant or the original */
  function getVariants(original: Variants): Variants {
    return prefersReduced ? reducedFade : original;
  }

  return { prefersReduced, getVariants };
}

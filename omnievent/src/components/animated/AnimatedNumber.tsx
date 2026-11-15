import React, { useEffect, useRef } from 'react';
import { useSpring, useMotionValue, motion } from 'framer-motion';
import { durations } from '../../lib/motion';

interface AnimatedNumberProps {
  value: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Prefix string, e.g. "$" */
  prefix?: string;
  /** Suffix string, e.g. "%" */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = durations.emphasized,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
    duration,
  });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix, decimals]);

  return (
    <motion.span ref={ref}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </motion.span>
  );
};

export default AnimatedNumber;

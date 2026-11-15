import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { durations } from '../../lib/motion';

interface AnimatedPanelProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPanel: React.FC<AnimatedPanelProps> = ({
  isOpen,
  children,
  className,
}) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          className={clsx('overflow-hidden', className)}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: 'auto',
            opacity: 1,
            transition: {
              height: { duration: durations.standard, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: durations.standard, delay: 0.05 },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: { duration: durations.standard, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: durations.fast },
            },
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedPanel;

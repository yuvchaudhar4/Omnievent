import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import { durations } from '../../lib/motion';

interface LoadingStateProps {
  steps: string[];
  currentStep: number;
  isComplete: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  steps,
  currentStep,
  isComplete,
}) => {
  const progress = isComplete
    ? 100
    : steps.length > 0
      ? (currentStep / steps.length) * 100
      : 0;

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: durations.emphasized, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Steps */}
      <ul className="space-y-2">
        {steps.map((step, index) => {
          const isCompleted = isComplete || index < currentStep;
          const isActive = !isComplete && index === currentStep;

          return (
            <motion.li
              key={step}
              className={clsx(
                'flex items-center gap-3 text-sm',
                isCompleted && 'text-emerald-400',
                isActive && 'text-white',
                !isCompleted && !isActive && 'text-white/40',
              )}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: durations.standard }}
            >
              {/* Icon area */}
              <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20"
                    >
                      <Check className="h-3 w-3 text-emerald-400" />
                    </motion.span>
                  ) : isActive ? (
                    <motion.span
                      key="active"
                      className="h-2 w-2 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  )}
                </AnimatePresence>
              </span>

              <span>{step}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};

export default LoadingState;

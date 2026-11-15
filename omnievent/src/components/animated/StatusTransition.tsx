import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { durations } from '../../lib/motion';

const defaultColorMap: Record<string, string> = {
  detected: '#f59e0b',
  analyzing: '#3b82f6',
  options_ready: '#8b5cf6',
  approved: '#10b981',
  resolved: '#6b7280',
  scheduled: '#3b82f6',
  active: '#10b981',
  completed: '#6b7280',
  disrupted: '#ef4444',
  rescheduled: '#f59e0b',
  pending: '#f59e0b',
  available: '#10b981',
  occupied: '#3b82f6',
  maintenance: '#ef4444',
  planning: '#8b5cf6',
  live: '#10b981',
};

/** Statuses that show a pulse animation */
const pulseStatuses = new Set([
  'active', 'live', 'analyzing', 'detected', 'disrupted', 'pending',
]);

interface StatusTransitionProps {
  status: string;
  colorMap?: Record<string, string>;
  className?: string;
}

export const StatusTransition: React.FC<StatusTransitionProps> = ({
  status,
  colorMap,
  className,
}) => {
  const mergedColors = { ...defaultColorMap, ...colorMap };
  const color = mergedColors[status] ?? '#6b7280';
  const shouldPulse = pulseStatuses.has(status);

  return (
    <span className={clsx('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-2.5 w-2.5">
        {/* Pulse ring */}
        {shouldPulse && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        {/* Solid dot */}
        <motion.span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          animate={{ backgroundColor: color }}
          transition={{ duration: durations.standard }}
        />
      </span>

      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          className="text-sm font-medium capitalize"
          style={{ color }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: durations.fast }}
        >
          {status.replace(/_/g, ' ')}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default StatusTransition;

import React, { useEffect } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { durations } from '../../lib/motion';

interface SuccessFeedbackProps {
  message: string;
  onComplete?: () => void;
}

export const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({
  message,
  onComplete,
}) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const runSequence = async () => {
      // Draw checkmark path
      await animate(
        '.checkmark-path',
        { pathLength: 1 },
        { duration: durations.emphasized, ease: [0.22, 1, 0.36, 1] },
      );
      // Green glow
      await animate(
        '.glow-ring',
        { opacity: [0, 0.6, 0], scale: [0.8, 1.4, 1.6] },
        { duration: 0.6, ease: 'easeOut' },
      );
      // Fade in message
      await animate(
        '.success-message',
        { opacity: 1, y: 0 },
        { duration: durations.standard, ease: [0.22, 1, 0.36, 1] },
      );

      onComplete?.();
    };

    runSequence();
  }, [animate, onComplete]);

  return (
    <div ref={scope} className="flex flex-col items-center gap-4">
      {/* Checkmark circle */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        {/* Glow ring */}
        <motion.div
          className="glow-ring absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)',
            opacity: 0,
          }}
        />

        {/* SVG checkmark */}
        <svg
          viewBox="0 0 52 52"
          className="h-14 w-14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circle background */}
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            stroke="#10b981"
            strokeWidth="2"
            fill="rgba(16,185,129,0.1)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durations.standard, ease: 'easeOut' }}
          />
          {/* Checkmark */}
          <motion.path
            className="checkmark-path"
            d="M15 27 L22 34 L37 19"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
          />
        </svg>
      </div>

      {/* Message */}
      <motion.p
        className="success-message text-sm font-medium text-emerald-400"
        initial={{ opacity: 0, y: 8 }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default SuccessFeedback;

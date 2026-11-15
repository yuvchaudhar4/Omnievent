import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useReducedMotion } from '../../lib/motion';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before the stagger sequence begins (seconds) */
  delay?: number;
  /** Delay between each child item (seconds) */
  staggerDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  delay = 0.1,
  staggerDelay = 0.07,
}) => {
  const { prefersReduced } = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReduced
        ? { duration: 0.15 }
        : {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
    },
  };

  return (
    <motion.div
      className={clsx(className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;

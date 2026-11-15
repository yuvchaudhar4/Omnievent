import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { pageEntrance, useReducedMotion } from '../../lib/motion';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className }) => {
  const { getVariants } = useReducedMotion();
  const variants = getVariants(pageEntrance);

  return (
    <motion.div
      className={clsx('w-full', className)}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;

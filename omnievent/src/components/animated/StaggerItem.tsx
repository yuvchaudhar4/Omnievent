import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { staggerItem, useReducedMotion } from '../../lib/motion';

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className }) => {
  const { getVariants } = useReducedMotion();
  const variants = getVariants(staggerItem);

  return (
    <motion.div className={clsx(className)} variants={variants}>
      {children}
    </motion.div>
  );
};

export default StaggerItem;

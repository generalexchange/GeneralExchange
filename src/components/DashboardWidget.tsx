/**
 * Compact dashboard metric / summary tile
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface DashboardWidgetProps {
  title: string;
  value: string;
  subtitle?: string;
  index?: number;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ title, value, subtitle, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-sm border border-white/[0.08] bg-dark-gray/60 px-4 py-4 sm:px-5 sm:py-5 hover:border-tan/25 transition-colors duration-300"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">{title}</p>
      <p className="font-display text-2xl sm:text-[1.65rem] text-neutral-100 tabular-nums leading-tight">{value}</p>
      {subtitle ? <p className="text-xs text-neutral-500 mt-2 leading-snug">{subtitle}</p> : null}
    </motion.div>
  );
};

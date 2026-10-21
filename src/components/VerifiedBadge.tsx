import React from 'react';
import { Check } from 'lucide-react';

export const VerifiedBadge: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <span className="inline-flex items-center justify-center text-sky-500 bg-sky-50 dark:bg-sky-950 rounded-full p-0.5">
    <Check size={size} className="stroke-[3]" />
  </span>
);

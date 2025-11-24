// ============= TYPEFORM PROGRESS =============
// Barra de progreso minimalista

import React from 'react';
import { motion } from 'framer-motion';

interface TypeformProgressProps {
  current: number;
  total: number;
}

export const TypeformProgress: React.FC<TypeformProgressProps> = ({ 
  current, 
  total 
}) => {
  const percentage = (current / total) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      {/* Progress bar */}
      <motion.div
        className="h-1 bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      
      {/* Step counter */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="text-sm font-medium text-muted-foreground">
            Paso {current} de {total}
          </div>
          <div className="text-sm font-medium text-primary">
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
    </div>
  );
};

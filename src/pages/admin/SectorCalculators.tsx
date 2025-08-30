import React from 'react';
import { SectorCalculatorManager } from '@/components/admin/SectorCalculatorManager';

const SectorCalculators: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectorCalculatorManager />
    </div>
  );
};

export default SectorCalculators;
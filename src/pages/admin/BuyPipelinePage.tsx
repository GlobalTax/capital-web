/**
 * Admin Buy Pipeline Page
 */

import React from 'react';
import { BuyPipelineView } from '@/features/leads-pipeline/components/BuyPipelineView';

const BuyPipelinePage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-120px)] p-4">
      <BuyPipelineView />
    </div>
  );
};

export default BuyPipelinePage;

/**
 * Admin Leads Pipeline Page
 */

import React from 'react';
import { LeadsPipelineView } from '@/features/leads-pipeline';

const LeadsPipelinePage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-120px)] p-4">
      <LeadsPipelineView />
    </div>
  );
};

export default LeadsPipelinePage;

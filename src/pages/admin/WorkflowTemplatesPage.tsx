// ============= WORKFLOW TEMPLATES PAGE =============
// Admin page for managing workflow task templates

import React from 'react';
import { WorkflowTemplatesManager } from '@/features/admin/components/workflow/WorkflowTemplatesManager';

const WorkflowTemplatesPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <WorkflowTemplatesManager />
    </div>
  );
};

export default WorkflowTemplatesPage;

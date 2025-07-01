
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import IntegrationsAnalyticsDashboard from '../IntegrationsAnalyticsDashboard';

const AnalyticsTabContent = () => {
  return (
    <TabsContent value="analytics">
      <IntegrationsAnalyticsDashboard />
    </TabsContent>
  );
};

export default AnalyticsTabContent;

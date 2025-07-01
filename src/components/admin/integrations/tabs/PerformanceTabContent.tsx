
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import IntegrationsPerformanceMonitor from '../IntegrationsPerformanceMonitor';

const PerformanceTabContent = () => {
  return (
    <TabsContent value="performance">
      <IntegrationsPerformanceMonitor />
    </TabsContent>
  );
};

export default PerformanceTabContent;

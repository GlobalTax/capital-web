
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import IntegrationsHealthDashboard from '../IntegrationsHealthDashboard';
import ApolloTestingPanel from '../ApolloTestingPanel';

const TestingTabContent = () => {
  return (
    <TabsContent value="testing">
      <div className="space-y-6">
        <IntegrationsHealthDashboard />
        <ApolloTestingPanel />
      </div>
    </TabsContent>
  );
};

export default TestingTabContent;

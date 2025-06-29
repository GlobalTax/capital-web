
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useMarketingHub } from '@/hooks/useMarketingHub';
import MarketingHubKPIs from './hub/MarketingHubKPIs';
import MarketingHubHeader from './hub/MarketingHubHeader';
import MarketingHubTabs from './hub/MarketingHubTabs';
import MarketingHubOverviewTab from './hub/MarketingHubOverviewTab';
import MarketingHubTrafficTab from './hub/MarketingHubTrafficTab';
import MarketingHubLoadingState from './hub/MarketingHubLoadingState';
import ContentPerformanceTab from './hub/ContentPerformanceTab';
import LeadScoringHubTab from './hub/LeadScoringHubTab';
import EmailMarketingTab from './hub/EmailMarketingTab';
import ROIAnalyticsTab from './hub/ROIAnalyticsTab';

const MarketingHubDashboard = () => {
  const {
    marketingMetrics,
    contentPerformance,
    leadScoringAnalytics,
    emailMetrics,
    roiAnalytics,
    isLoadingMetrics
  } = useMarketingHub();

  const [activeTab, setActiveTab] = useState('overview');

  if (isLoadingMetrics) {
    return <MarketingHubLoadingState />;
  }

  return (
    <div className="space-y-6">
      <MarketingHubHeader />
      
      <MarketingHubKPIs metrics={marketingMetrics} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <MarketingHubTabs />

        <TabsContent value="overview" className="space-y-6">
          <MarketingHubOverviewTab 
            marketingMetrics={marketingMetrics} 
            roiAnalytics={roiAnalytics} 
          />
        </TabsContent>

        <TabsContent value="content">
          <ContentPerformanceTab contentPerformance={contentPerformance} />
        </TabsContent>

        <TabsContent value="leads">
          <LeadScoringHubTab 
            leadScoringAnalytics={leadScoringAnalytics} 
            marketingMetrics={marketingMetrics}
          />
        </TabsContent>

        <TabsContent value="email">
          <EmailMarketingTab emailMetrics={emailMetrics} />
        </TabsContent>

        <TabsContent value="roi">
          <ROIAnalyticsTab roiAnalytics={roiAnalytics} />
        </TabsContent>

        <TabsContent value="traffic">
          <MarketingHubTrafficTab marketingMetrics={marketingMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingHubDashboard;

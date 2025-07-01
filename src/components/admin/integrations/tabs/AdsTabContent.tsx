
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import GoogleAdsAttributionTab from '../GoogleAdsAttributionTab';
import { AdConversion, AttributionTouchpoint } from '@/types/integrations';

interface AdsTabContentProps {
  adConversions: AdConversion[];
  touchpoints: AttributionTouchpoint[];
}

const AdsTabContent = ({ adConversions, touchpoints }: AdsTabContentProps) => {
  return (
    <TabsContent value="ads">
      <GoogleAdsAttributionTab 
        adConversions={adConversions}
        touchpoints={touchpoints}
      />
    </TabsContent>
  );
};

export default AdsTabContent;

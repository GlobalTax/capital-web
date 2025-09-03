import React from 'react';
import TrackingConfig from '@/components/admin/TrackingConfig';
import { AnalyticsDebugger } from '@/components/admin/AnalyticsDebugger';

const TrackingConfigPage = () => {
  return (
    <div className="space-y-6">
      <TrackingConfig />
      <AnalyticsDebugger />
    </div>
  );
};

export default TrackingConfigPage;
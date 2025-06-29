
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Mail, TrendingUp, Target, FileText } from 'lucide-react';

const MarketingHubTabs = () => {
  return (
    <TabsList className="grid w-full grid-cols-6">
      <TabsTrigger value="overview">
        <BarChart3 className="h-4 w-4 mr-2" />
        Overview
      </TabsTrigger>
      <TabsTrigger value="content">
        <FileText className="h-4 w-4 mr-2" />
        Contenido
      </TabsTrigger>
      <TabsTrigger value="leads">
        <Target className="h-4 w-4 mr-2" />
        Lead Scoring
      </TabsTrigger>
      <TabsTrigger value="email">
        <Mail className="h-4 w-4 mr-2" />
        Email Marketing
      </TabsTrigger>
      <TabsTrigger value="roi">
        <TrendingUp className="h-4 w-4 mr-2" />
        ROI Analytics
      </TabsTrigger>
      <TabsTrigger value="traffic">
        <Users className="h-4 w-4 mr-2" />
        Traffic Intel
      </TabsTrigger>
    </TabsList>
  );
};

export default MarketingHubTabs;

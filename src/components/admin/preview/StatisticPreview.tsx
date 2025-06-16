
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface StatisticPreviewProps {
  statistic: {
    metric_value: string;
    metric_label: string;
    metric_key: string;
  };
}

const StatisticPreview = ({ statistic }: StatisticPreviewProps) => {
  return (
    <div className="p-6 bg-gray-50">
      <h3 className="text-lg font-medium text-black mb-4">Vista Previa - Estadística</h3>
      <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center max-w-sm mx-auto">
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-black mb-1">
            {statistic.metric_value}
          </div>
          <div className="text-gray-600 text-sm mb-2">
            {statistic.metric_label}
          </div>
          <div className="text-sm font-medium text-green-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +15% vs Q3
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticPreview;

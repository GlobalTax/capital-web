
import React from 'react';

interface AnalyticsHeaderProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const AnalyticsHeader = ({ timeRange, onTimeRangeChange }: AnalyticsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">📊 Analytics Avanzados</h2>
      <div className="flex gap-2">
        {['7d', '30d', '90d'].map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range)}
            className={`px-3 py-1 rounded text-sm ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range === '7d' ? '7 días' : range === '30d' ? '30 días' : '90 días'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsHeader;

import React from 'react';
import { useCountAnimation } from '@/hooks/useCountAnimation';

interface StatisticCardProps {
  label: string;
  numericValue: number;
  suffix: string;
  delay: number;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ 
  label, 
  numericValue, 
  suffix, 
  delay 
}) => {
  const { count, ref } = useCountAnimation(numericValue, 2000 + delay, suffix);
  
  return (
    <div 
      ref={ref}
      className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="text-3xl md:text-4xl font-bold text-black mb-2">
        {count}
      </div>
      <div className="text-sm text-gray-600 font-medium">
        {label}
      </div>
    </div>
  );
};

export default StatisticCard;
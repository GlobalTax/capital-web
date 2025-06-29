
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MinimalMetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  href: string;
}

const MinimalMetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  href 
}: MinimalMetricCardProps) => {
  return (
    <Link
      to={href}
      className="group block bg-white rounded-xl border border-gray-200/50 p-6 hover:border-gray-300/50 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-medium text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">recursos</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
};

export default MinimalMetricCard;

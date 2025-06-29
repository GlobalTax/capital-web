
import React from 'react';
import { LucideIcon } from 'lucide-react';
import LegalCard from '../ui/LegalCard';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: LucideIcon;
}

const StatCard = ({ title, value, change, changeType, icon: Icon }: StatCardProps) => {
  const changeColor = changeType === 'positive' ? 'success-text' : 'error-text';

  return (
    <LegalCard className="stat-card">
      <div className="flex items-center justify-between">
        <p className="card-title truncate">{title}</p>
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <div className="mt-2">
        <p className="kpi-value">{value}</p>
        {change && (
          <p className="mt-1 body-text">
            <span className={changeColor}>{change}</span> desde el mes pasado
          </p>
        )}
      </div>
    </LegalCard>
  );
};

export default StatCard;

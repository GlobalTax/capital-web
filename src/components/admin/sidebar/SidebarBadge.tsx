import React from 'react';
import { Sparkles, Flame } from 'lucide-react';

interface SidebarBadgeProps {
  badge: 'URGENTE' | 'AI';
}

export const SidebarBadge: React.FC<SidebarBadgeProps> = ({ badge }) => {
  const getBadgeConfig = () => {
    switch (badge) {
      case 'URGENTE':
        return {
          className: 'bg-red-500/10 text-red-600 border border-red-200',
          icon: <Flame className="h-2.5 w-2.5" />,
          label: 'HOT'
        };
      case 'AI':
        return {
          className: 'bg-violet-500/10 text-violet-600 border border-violet-200',
          icon: <Sparkles className="h-2.5 w-2.5" />,
          label: 'AI'
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  if (!config) return null;

  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};
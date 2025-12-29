import React from 'react';
import { Sparkles, Flame, Clock } from 'lucide-react';

interface SidebarBadgeProps {
  badge: 'URGENTE' | 'AI' | 'NEW';
  addedDate?: string; // ISO date string when feature was added
}

// Features added within this many days show NEW badge
const NEW_BADGE_EXPIRY_DAYS = 30;

export const SidebarBadge: React.FC<SidebarBadgeProps> = ({ badge, addedDate }) => {
  // Check if NEW badge should still be shown based on addedDate
  if (badge === 'NEW' && addedDate) {
    const addedTime = new Date(addedDate).getTime();
    const now = Date.now();
    const daysSinceAdded = (now - addedTime) / (1000 * 60 * 60 * 24);
    
    // If more than 30 days old, don't show NEW badge
    if (daysSinceAdded > NEW_BADGE_EXPIRY_DAYS) {
      return null;
    }
  }

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
      case 'NEW':
        return {
          className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200',
          icon: null,
          label: 'NEW'
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
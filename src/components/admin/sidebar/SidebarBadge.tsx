import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SidebarBadgeProps {
  badge: 'URGENTE' | 'AI' | 'NEW';
}

export const SidebarBadge: React.FC<SidebarBadgeProps> = ({ badge }) => {
  const getBadgeStyles = () => {
    switch (badge) {
      case 'URGENTE':
        return 'bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse';
      case 'AI':
        return 'bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full';
      case 'NEW':
        return 'bg-green-500 text-white text-xs px-2 py-0.5 rounded-full';
      default:
        return '';
    }
  };

  return <span className={getBadgeStyles()}>{badge}</span>;
};
import React from 'react';
import { Link } from 'react-router-dom';
import { icons, LucideIcon } from 'lucide-react';
import { Highlight } from './useHighlights';
import { cn } from '@/lib/utils';

interface HighlightCardProps {
  highlight: Highlight;
}

const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-600' },
};

export const HighlightCard: React.FC<HighlightCardProps> = ({ highlight }) => {
  const Icon = (icons[highlight.icon as keyof typeof icons] as LucideIcon) || icons.Link;
  const colors = colorClasses[highlight.color] || colorClasses.blue;

  const isExternal = highlight.url.startsWith('http');
  
  const content = (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
      <div className={cn('p-1.5 rounded-md', colors.bg)}>
        <Icon className={cn('h-4 w-4', colors.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {highlight.title}
        </p>
        {highlight.description && (
          <p className="text-xs text-muted-foreground truncate">
            {highlight.description}
          </p>
        )}
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={highlight.url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link to={highlight.url}>{content}</Link>;
};

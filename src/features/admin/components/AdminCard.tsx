// ============= ADMIN CARD COMPONENT =============
// Standardized card component for admin panels

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  children?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
    icon?: LucideIcon;
  }>;
  className?: string;
  loading?: boolean;
}

export const AdminCard = ({ 
  title, 
  description, 
  icon: Icon, 
  badge,
  children,
  actions,
  className,
  loading = false
}: AdminCardProps) => {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
        </div>
        {badge && (
          <Badge variant={badge.variant || 'default'}>
            {badge.text}
          </Badge>
        )}
      </CardHeader>
      
      {children && (
        <CardContent className={loading ? 'animate-pulse' : ''}>
          {children}
        </CardContent>
      )}
      
      {actions && actions.length > 0 && (
        <CardContent className="pt-0">
          <div className="flex gap-2 flex-wrap">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                className="flex items-center gap-2"
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
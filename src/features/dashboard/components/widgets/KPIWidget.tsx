import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { BaseWidget } from './WidgetFactory';

interface KPIWidgetProps {
  widget: BaseWidget;
  isEditing?: boolean;
  onEdit?: (widget: BaseWidget) => void;
  onDelete?: (widgetId: string) => void;
  isDragging?: boolean;
}

export function KPIWidget({ widget, isEditing, onEdit, onDelete, isDragging }: KPIWidgetProps) {
  // Mock data - en producción vendría de una API o store
  const mockData = {
    total_users: { value: 1547, change: 12.3, trend: 'up' },
    total_revenue: { value: 125000, change: -2.1, trend: 'down' },
    active_leads: { value: 234, change: 8.7, trend: 'up' },
    conversion_rate: { value: 24.5, change: 3.2, trend: 'up' },
    monthly_revenue: { value: 45000, change: 15.6, trend: 'up' },
    basic_stats: { value: 892, change: 5.4, trend: 'up' },
    total_views: { value: 15678, change: 22.1, trend: 'up' },
    blog_engagement: { value: 68.3, change: -1.2, trend: 'down' }
  };

  const data = mockData[widget.config?.metric as keyof typeof mockData] || { value: 0, change: 0, trend: 'up' };
  
  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value}%`;
      default:
        return new Intl.NumberFormat('es-ES').format(value);
    }
  };

  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-1';
    }
  };

  return (
    <Card className={`${isDragging ? 'opacity-50' : ''} ${getSizeClasses()} hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {widget.title}
        </CardTitle>
        {isEditing && (
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit?.(widget)}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete?.(widget.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(data.value, widget.config?.format)}
        </div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
          {data.trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={`${data.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {data.change > 0 ? '+' : ''}{data.change}%
          </span>
          <span>desde el último período</span>
        </div>
      </CardContent>
    </Card>
  );
}
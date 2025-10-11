import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Trash2 } from 'lucide-react';
import { 
  LazyResponsiveContainer, 
  LazyLineChart, 
  LazyLine, 
  LazyAreaChart, 
  LazyArea, 
  LazyBarChart, 
  LazyBar, 
  LazyXAxis, 
  LazyYAxis, 
  LazyTooltip 
} from '@/components/shared/LazyChart';
import { BaseWidget } from './WidgetFactory';

interface ChartWidgetProps {
  widget: BaseWidget;
  isEditing?: boolean;
  onEdit?: (widget: BaseWidget) => void;
  onDelete?: (widgetId: string) => void;
  isDragging?: boolean;
}

export function ChartWidget({ widget, isEditing, onEdit, onDelete, isDragging }: ChartWidgetProps) {
  // Mock data - en producción vendría de una API
  const mockData = {
    conversion_funnel: [
      { name: 'Ene', value: 45, leads: 120 },
      { name: 'Feb', value: 52, leads: 98 },
      { name: 'Mar', value: 48, leads: 145 },
      { name: 'Abr', value: 61, leads: 167 },
      { name: 'May', value: 55, leads: 134 },
      { name: 'Jun', value: 67, leads: 189 }
    ],
    content_metrics: [
      { name: 'Blog', views: 1200, engagement: 65 },
      { name: 'Casos', views: 890, engagement: 78 },
      { name: 'Recursos', views: 654, engagement: 45 },
      { name: 'Testimonios', views: 432, engagement: 82 }
    ],
    seo_performance: [
      { name: 'Ene', organic: 2400, paid: 1400 },
      { name: 'Feb', organic: 1398, paid: 2210 },
      { name: 'Mar', organic: 2800, paid: 2290 },
      { name: 'Abr', organic: 3908, paid: 2000 },
      { name: 'May', organic: 4800, paid: 2181 },
      { name: 'Jun', organic: 3800, paid: 2500 }
    ],
    public_metrics: [
      { name: 'Q1', value: 4000 },
      { name: 'Q2', value: 3000 },
      { name: 'Q3', value: 5000 },
      { name: 'Q4', value: 4500 }
    ]
  };

  const data = mockData[widget.config?.metric as keyof typeof mockData] || mockData.public_metrics;

  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-2';
    }
  };

  const getChartHeight = () => {
    switch (widget.size) {
      case 'small': return 120;
      case 'medium': return 200;
      case 'large': return 300;
      default: return 200;
    }
  };

  const renderChart = () => {
    const height = getChartHeight();
    
    switch (widget.config?.chartType) {
      case 'area':
        return (
          <LazyAreaChart data={data}>
            <LazyXAxis dataKey="name" />
            <LazyYAxis />
            <LazyTooltip />
            <LazyArea type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
            {'organic' in data[0] && <LazyArea type="monotone" dataKey="organic" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.2} />}
          </LazyAreaChart>
        );
      case 'bar':
        return (
          <LazyBarChart data={data}>
            <LazyXAxis dataKey="name" />
            <LazyYAxis />
            <LazyTooltip />
            <LazyBar dataKey="views" fill="hsl(var(--primary))" />
            {'engagement' in data[0] && <LazyBar dataKey="engagement" fill="hsl(var(--secondary))" />}
          </LazyBarChart>
        );
      default:
        return (
          <LazyLineChart data={data}>
            <LazyXAxis dataKey="name" />
            <LazyYAxis />
            <LazyTooltip />
            <LazyLine type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
            {'leads' in data[0] && <LazyLine type="monotone" dataKey="leads" stroke="hsl(var(--secondary))" strokeWidth={2} />}
          </LazyLineChart>
        );
    }
  };

  return (
    <Card className={`${isDragging ? 'opacity-50' : ''} ${getSizeClasses()} hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
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
        <LazyResponsiveContainer height={getChartHeight()}>
          <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando gráfico...</div>}>
            {renderChart()}
          </Suspense>
        </LazyResponsiveContainer>
      </CardContent>
    </Card>
  );
}
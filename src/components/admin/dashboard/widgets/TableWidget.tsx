import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Trash2, ExternalLink } from 'lucide-react';
import { BaseWidget } from './WidgetFactory';

interface TableWidgetProps {
  widget: BaseWidget;
  isEditing?: boolean;
  onEdit?: (widget: BaseWidget) => void;
  onDelete?: (widgetId: string) => void;
  isDragging?: boolean;
}

export function TableWidget({ widget, isEditing, onEdit, onDelete, isDragging }: TableWidgetProps) {
  // Mock data - en producción vendría de una API
  const mockData = {
    lead_pipeline: [
      { id: 1, company: 'TechCorp S.L.', contact: 'María García', stage: 'Qualified', value: '€45,000', score: 85 },
      { id: 2, company: 'Innovation Ltd', contact: 'Carlos Ruiz', stage: 'Proposal', value: '€78,000', score: 72 },
      { id: 3, company: 'StartupXYZ', contact: 'Ana López', stage: 'Discovery', value: '€23,000', score: 68 },
      { id: 4, company: 'BigCorp Inc', contact: 'Pedro Silva', stage: 'Negotiation', value: '€156,000', score: 91 },
      { id: 5, company: 'SmallBiz SL', contact: 'Laura Martín', stage: 'Qualified', value: '€12,000', score: 45 }
    ],
    recent_posts: [
      { id: 1, title: 'Tendencias M&A 2024', author: 'Equipo Capittal', views: 1234, status: 'Published' },
      { id: 2, title: 'Valoración de Startups', author: 'Equipo Capittal', views: 987, status: 'Draft' },
      { id: 3, title: 'Due Diligence Digital', author: 'Equipo Capittal', views: 2341, status: 'Published' },
      { id: 4, title: 'Fusiones en Tech', author: 'Equipo Capittal', views: 1567, status: 'Published' },
      { id: 5, title: 'Exit Strategies', author: 'Equipo Capittal', views: 892, status: 'Review' }
    ]
  };

  const data = mockData[widget.config?.tableType as keyof typeof mockData] || mockData.recent_posts;
  const limit = widget.config?.limit || 5;
  const displayData = data.slice(0, limit);

  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-2';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'review': return 'outline';
      case 'qualified': return 'default';
      case 'proposal': return 'secondary';
      case 'discovery': return 'outline';
      case 'negotiation': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderTableContent = () => {
    if (widget.config?.tableType === 'lead_pipeline') {
      return (
        <div className="space-y-2">
          {displayData.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.company}</p>
                <p className="text-xs text-muted-foreground">{item.contact}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(item.stage)} className="text-xs">
                  {item.stage}
                </Badge>
                <span className="text-sm font-medium">{item.value}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{item.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {displayData.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.author}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.views} views</span>
              <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                {item.status}
              </Badge>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
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
        {renderTableContent()}
      </CardContent>
    </Card>
  );
}
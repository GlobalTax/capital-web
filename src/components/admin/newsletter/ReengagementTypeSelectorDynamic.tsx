import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Check, Clock, RefreshCw, TrendingUp, Calendar, Mail, Sparkles, Lock } from 'lucide-react';
import { useReengagementTemplates, ReengagementTemplate } from '@/hooks/useReengagementTemplates';

const ICON_MAP: Record<string, React.ElementType> = {
  'clock': Clock,
  'refresh-cw': RefreshCw,
  'trending-up': TrendingUp,
  'calendar': Calendar,
  'mail': Mail,
  'sparkles': Sparkles,
};

interface ReengagementTypeSelectorProps {
  selectedTemplateId: string | null;
  onTemplateChange: (template: ReengagementTemplate) => void;
}

export const ReengagementTypeSelectorDynamic: React.FC<ReengagementTypeSelectorProps> = ({
  selectedTemplateId,
  onTemplateChange,
}) => {
  const { templates, isLoading } = useReengagementTemplates();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Tipo de Re-engagement</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Tipo de Re-engagement</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {templates?.map((template) => {
          const Icon = ICON_MAP[template.icon] || Mail;
          const isSelected = selectedTemplateId === template.id;

          return (
            <Card
              key={template.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md relative',
                isSelected
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'hover:border-muted-foreground/50'
              )}
              onClick={() => onTemplateChange(template)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
              <CardContent className="pt-5 pb-4 px-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        isSelected ? 'bg-primary/10' : 'bg-muted'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-medium text-sm">{template.label}</h4>
                      {template.is_system && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <Badge variant="outline" className="text-xs w-fit">
                    {template.trigger_condition}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Brevo segment hint */}
      {selectedTemplateId && (
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <span className="font-medium">Segmento Brevo:</span>{' '}
          <code className="bg-background px-2 py-0.5 rounded text-xs">
            {templates?.find(t => t.id === selectedTemplateId)?.brevo_segment}
          </code>
        </div>
      )}
    </div>
  );
};

// Legacy export for backwards compatibility
export type { ReengagementTemplate };

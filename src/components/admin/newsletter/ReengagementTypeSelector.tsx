import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, Clock, RefreshCw, TrendingUp, Calendar, Mail } from 'lucide-react';
import { ReengagementType, REENGAGEMENT_TYPES } from './templates/reengagementTemplates';

const ICONS: Record<ReengagementType, React.ElementType> = {
  abandoned: Clock,
  reactivation: RefreshCw,
  value_added: TrendingUp,
  revaluation: Calendar,
  nurturing: Mail,
};

interface ReengagementTypeSelectorProps {
  selectedType: ReengagementType;
  onTypeChange: (type: ReengagementType) => void;
}

export const ReengagementTypeSelector: React.FC<ReengagementTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Tipo de Re-engagement</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {REENGAGEMENT_TYPES.map((type) => {
          const Icon = ICONS[type.id];
          const isSelected = selectedType === type.id;

          return (
            <Card
              key={type.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md relative',
                isSelected
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'hover:border-muted-foreground/50'
              )}
              onClick={() => onTypeChange(type.id)}
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
                    <h4 className="font-medium text-sm">{type.label}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {type.description}
                  </p>
                  <Badge variant="outline" className="text-xs w-fit">
                    {type.triggerCondition}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Brevo segment hint */}
      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <span className="font-medium">Segmento Brevo:</span>{' '}
        <code className="bg-background px-2 py-0.5 rounded text-xs">
          {REENGAGEMENT_TYPES.find(t => t.id === selectedType)?.brevoSegment}
        </code>
      </div>
    </div>
  );
};

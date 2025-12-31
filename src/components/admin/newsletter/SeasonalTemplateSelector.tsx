import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { SEASONAL_TYPES, SeasonalType, getSeasonalConfig } from './templates/seasonalTemplates';

interface SeasonalTemplateSelectorProps {
  selectedType: SeasonalType;
  onTypeChange: (type: SeasonalType) => void;
  year: number;
  onYearChange: (year: number) => void;
}

export const SeasonalTemplateSelector: React.FC<SeasonalTemplateSelectorProps> = ({
  selectedType,
  onTypeChange,
  year,
  onYearChange,
}) => {
  // Default to next year if we're in December
  const defaultYear = new Date().getMonth() === 11 
    ? new Date().getFullYear() + 1 
    : new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex items-center gap-4">
        <Label htmlFor="seasonal-year" className="text-sm font-medium whitespace-nowrap">
          Año de la campaña:
        </Label>
        <Input
          id="seasonal-year"
          type="number"
          min={new Date().getFullYear()}
          max={new Date().getFullYear() + 5}
          value={year}
          onChange={(e) => onYearChange(parseInt(e.target.value) || defaultYear)}
          className="w-24"
        />
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SEASONAL_TYPES.map((template) => {
          const isSelected = selectedType === template.id;

          return (
            <Card
              key={template.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md relative',
                isSelected
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-muted-foreground/50'
              )}
              onClick={() => onTypeChange(template.id)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
              <CardContent className="pt-6 pb-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={cn(
                      'text-3xl',
                      isSelected ? 'opacity-100' : 'opacity-70'
                    )}
                  >
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{template.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.typicalMonth}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Template Info */}
      {selectedType && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Asunto sugerido:</strong>{' '}
            {getSeasonalConfig(selectedType).defaultSubject.replace('{year}', year.toString())}
          </p>
        </div>
      )}
    </div>
  );
};

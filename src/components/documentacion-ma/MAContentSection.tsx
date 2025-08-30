import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MACategory } from './MAResourcesFilter';

interface MAResource {
  title: string;
  type: 'template' | 'checklist' | 'guide' | 'example';
  url?: string;
  downloadable?: boolean;
}

export type { MAResource };

interface MAContentItem {
  id: MACategory;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  content: {
    overview: string;
    keyPoints: string[];
    resources: MAResource[];
    examples?: string[];
  };
}

interface MAContentSectionProps {
  item: MAContentItem;
  isOpen: boolean;
  onToggle: () => void;
}

export const MAContentSection: React.FC<MAContentSectionProps> = ({
  item,
  isOpen,
  onToggle
}) => {
  const Icon = item.icon;

  return (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Resumen</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {item.content.overview}
                </p>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Puntos Clave</h4>
                <ul className="space-y-2">
                  {item.content.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examples */}
              {item.content.examples && item.content.examples.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Ejemplos</h4>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    {item.content.examples.map((example, index) => (
                      <p key={index} className="text-sm text-muted-foreground italic">
                        "{example}"
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Recursos Disponibles</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {item.content.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        <span className="text-sm font-medium">{resource.title}</span>
                      </div>
                      <div className="flex gap-1">
                        {resource.downloadable && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                        {resource.url && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Calculator, TrendingUp, Package, Calendar } from 'lucide-react';
import { StaticLandingPage } from '@/config/static-landing-pages';
import { toast } from 'sonner';

interface StaticLandingCardProps {
  landing: StaticLandingPage;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'calculator': return <Calculator className="h-3 w-3" />;
    case 'conversion': return <TrendingUp className="h-3 w-3" />;
    case 'product': return <Package className="h-3 w-3" />;
    case 'event': return <Calendar className="h-3 w-3" />;
    default: return null;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'calculator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'conversion': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'product': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'event': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const StaticLandingCard: React.FC<StaticLandingCardProps> = ({ landing }) => {
  const handleCopyUrl = () => {
    const fullUrl = `${window.location.origin}${landing.url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('URL copiada al portapapeles');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className={getTypeColor(landing.type)}>
              {getTypeIcon(landing.type)}
              <span className="ml-1">{landing.type}</span>
            </Badge>
            {landing.isActive && (
              <Badge variant="default" className="bg-green-600">Activa</Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg">{landing.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{landing.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <code className="bg-muted px-2 py-1 rounded text-xs flex-1 truncate">{landing.url}</code>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={handleCopyUrl}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {landing.features.map(feature => (
            <Badge key={feature} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Source: <code className="bg-muted px-1 rounded">{landing.source_project}</code>
        </div>
        
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Actualizado: {new Date(landing.lastUpdated).toLocaleDateString('es-ES')}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full"
          onClick={() => window.open(landing.url, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Landing
        </Button>
      </CardFooter>
    </Card>
  );
};

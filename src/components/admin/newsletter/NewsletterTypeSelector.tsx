import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Building2, Newspaper, Bell, GraduationCap, Check, Search, Zap } from 'lucide-react';

export type NewsletterType = 'opportunities' | 'news' | 'updates' | 'educational' | 'buyside' | 'automation';

interface NewsletterTypeConfig {
  id: NewsletterType;
  label: string;
  icon: React.ElementType;
  description: string;
  frequency: string;
  defaultSubject: string;
}

export const NEWSLETTER_TYPES: NewsletterTypeConfig[] = [
  {
    id: 'opportunities',
    label: 'Oportunidades',
    icon: Building2,
    description: 'Selección curada de operaciones de inversión',
    frequency: 'Semanal',
    defaultSubject: 'Oportunidades de la Semana – Capittal',
  },
  {
    id: 'buyside',
    label: 'Empresas Buscadas',
    icon: Search,
    description: 'Perfiles de empresas que buscan nuestros inversores',
    frequency: 'Semanal/Quincenal',
    defaultSubject: 'Empresas Buscadas – Capittal',
  },
  {
    id: 'news',
    label: 'Noticias M&A',
    icon: Newspaper,
    description: 'Artículos del blog y análisis de tendencias',
    frequency: 'Mensual/Quincenal',
    defaultSubject: 'Noticias M&A – Capittal',
  },
  {
    id: 'updates',
    label: 'Actualizaciones',
    icon: Bell,
    description: 'Novedades de Capittal (mandatos, eventos, hitos)',
    frequency: 'Puntual',
    defaultSubject: 'Novedades Capittal',
  },
  {
    id: 'educational',
    label: 'Contenido Educativo',
    icon: GraduationCap,
    description: 'Guías, tips y reflexiones sobre M&A',
    frequency: 'Mensual',
    defaultSubject: 'Guía M&A – Capittal',
  },
  {
    id: 'automation',
    label: 'Automatización',
    icon: Zap,
    description: 'Templates para automatizaciones y secuencias de email',
    frequency: 'Según trigger',
    defaultSubject: 'Novedades para ti – Capittal',
  },
];

interface NewsletterTypeSelectorProps {
  selectedType: NewsletterType;
  onTypeChange: (type: NewsletterType) => void;
}

export const NewsletterTypeSelector: React.FC<NewsletterTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {NEWSLETTER_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;

        return (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md relative',
              isSelected
                ? 'ring-2 ring-primary border-primary'
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
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className={cn(
                    'p-3 rounded-lg',
                    isSelected ? 'bg-primary/10' : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {type.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {type.frequency}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export const getNewsletterTypeConfig = (type: NewsletterType): NewsletterTypeConfig => {
  return NEWSLETTER_TYPES.find((t) => t.id === type) || NEWSLETTER_TYPES[0];
};

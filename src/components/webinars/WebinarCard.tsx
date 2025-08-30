import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, Users, Star } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Webinar } from '@/hooks/useWebinars';

interface WebinarCardProps {
  webinar: Webinar;
  onViewDetails?: (webinar: Webinar) => void;
  onRegister?: (webinar: Webinar) => void;
}

export const WebinarCard: React.FC<WebinarCardProps> = ({ 
  webinar, 
  onViewDetails, 
  onRegister 
}) => {
  const isCompleted = webinar.status === 'completed';
  const isScheduled = webinar.status === 'scheduled';
  const isPast = new Date(webinar.webinar_date) < new Date();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: es });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fundamentos M&A': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Sectores Específicos': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Estrategia y Preparación': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Mercado y Tendencias': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border bg-card">
      {webinar.is_featured && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Destacado
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Badge 
              variant="outline" 
              className={`mb-2 ${getCategoryColor(webinar.category)}`}
            >
              {webinar.category}
            </Badge>
            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
              {webinar.title}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {webinar.short_description || webinar.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Speaker Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={webinar.speaker_avatar_url} />
            <AvatarFallback>
              {webinar.speaker_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{webinar.speaker_name}</p>
            <p className="text-xs text-muted-foreground">
              {webinar.speaker_title}
              {webinar.speaker_company && ` · ${webinar.speaker_company}`}
            </p>
          </div>
        </div>

        {/* Webinar Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDate(webinar.webinar_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{webinar.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{webinar.attendee_count} asistentes</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Badge 
              variant={isCompleted ? "secondary" : isScheduled ? "default" : "destructive"}
              className="text-xs"
            >
              {isCompleted ? 'Completado' : isScheduled ? 'Programado' : 'Cancelado'}
            </Badge>
          </div>
        </div>

        {/* Tags */}
        {webinar.tags && webinar.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {webinar.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {webinar.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{webinar.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails?.(webinar)}
          >
            Ver Detalles
          </Button>
          
          {isScheduled && !isPast && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onRegister?.(webinar)}
            >
              Registrarse
            </Button>
          )}
          
          {isCompleted && webinar.recording_url && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => window.open(webinar.recording_url, '_blank')}
            >
              Ver Grabación
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
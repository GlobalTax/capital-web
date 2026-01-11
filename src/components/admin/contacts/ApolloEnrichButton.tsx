import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ApolloStatus } from '@/types/apollo';

interface ApolloEnrichButtonProps {
  status: ApolloStatus;
  error?: string | null;
  lastEnrichedAt?: string | null;
  isLoading?: boolean;
  onEnrich: () => void;
  onSelectCompany: () => void;
}

export const ApolloEnrichButton: React.FC<ApolloEnrichButtonProps> = ({
  status,
  error,
  lastEnrichedAt,
  isLoading,
  onEnrich,
  onSelectCompany,
}) => {
  // Loading state (running or external loading)
  if (status === 'running' || isLoading) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled 
        className="h-7 text-xs gap-1.5"
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Enriqueciendo...
      </Button>
    );
  }

  // Success state
  if (status === 'ok') {
    return (
      <div className="flex items-center gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="bg-green-50 text-green-700 border-green-200 h-6 gap-1 text-[10px] cursor-default"
              >
                <CheckCircle2 className="h-3 w-3" />
                Apollo
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">
                Enriquecido el {lastEnrichedAt 
                  ? format(new Date(lastEnrichedAt), "d 'de' MMM 'a las' HH:mm", { locale: es })
                  : 'fecha desconocida'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnrich();
                }}
              >
                <RefreshCw className="h-3 w-3 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Actualizar datos</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Needs review state
  if (status === 'needs_review') {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1.5 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
        onClick={(e) => {
          e.stopPropagation();
          onSelectCompany();
        }}
      >
        <AlertTriangle className="h-3 w-3" />
        Elegir empresa
      </Button>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="bg-red-50 text-red-700 border-red-200 h-6 gap-1 text-[10px] cursor-default"
              >
                <XCircle className="h-3 w-3" />
                Error
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">{error || 'Error desconocido al enriquecer'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs px-2"
          onClick={(e) => {
            e.stopPropagation();
            onEnrich();
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  // Default/none state
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs gap-1.5"
      onClick={(e) => {
        e.stopPropagation();
        onEnrich();
      }}
    >
      <Sparkles className="h-3 w-3" />
      Apollo
    </Button>
  );
};

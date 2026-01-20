import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Lock, Unlock, Shield, ShieldOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideApprovalControlsProps {
  slideId: string;
  isApproved: boolean;
  isLocked: boolean;
  approvedAt?: string | null;
  onApprove: () => void;
  onUnlock: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'inline';
}

export const SlideApprovalControls: React.FC<SlideApprovalControlsProps> = ({
  slideId,
  isApproved,
  isLocked,
  approvedAt,
  onApprove,
  onUnlock,
  isLoading = false,
  variant = 'default'
}) => {
  const isProtected = isApproved || isLocked;

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isProtected ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-7 w-7",
                isProtected && "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50"
              )}
              onClick={isProtected ? onUnlock : onApprove}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isProtected ? (
                <Lock className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isProtected ? 'Desbloquear slide' : 'Aprobar y bloquear'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant={isProtected ? "default" : "outline"}
          className={cn(
            "text-xs",
            isProtected && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          )}
        >
          {isProtected ? (
            <>
              <Shield className="h-3 w-3 mr-1" />
              Protegido
            </>
          ) : (
            <>
              <ShieldOff className="h-3 w-3 mr-1" />
              Borrador
            </>
          )}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={isProtected ? onUnlock : onApprove}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : isProtected ? (
            'Desbloquear'
          ) : (
            'Aprobar'
          )}
        </Button>
      </div>
    );
  }

  // Default variant - full card style
  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-2",
      isProtected 
        ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800" 
        : "bg-muted/50"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isProtected ? (
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={cn(
            "text-sm font-medium",
            isProtected 
              ? "text-emerald-700 dark:text-emerald-400" 
              : "text-muted-foreground"
          )}>
            {isProtected ? 'Slide Aprobado' : 'Borrador'}
          </span>
        </div>
        
        <Button
          variant={isProtected ? "outline" : "default"}
          size="sm"
          onClick={isProtected ? onUnlock : onApprove}
          disabled={isLoading}
          className={cn(
            isProtected && "border-emerald-300 hover:bg-emerald-100 dark:border-emerald-700"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isProtected ? (
            <Unlock className="h-4 w-4 mr-2" />
          ) : (
            <Lock className="h-4 w-4 mr-2" />
          )}
          {isProtected ? 'Desbloquear' : 'Aprobar'}
        </Button>
      </div>

      {isProtected && approvedAt && (
        <p className="text-xs text-emerald-600 dark:text-emerald-500">
          Aprobado el {new Date(approvedAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      )}

      {!isProtected && (
        <p className="text-xs text-muted-foreground">
          Este slide puede ser modificado al crear una nueva versión.
        </p>
      )}
    </div>
  );
};

export default SlideApprovalControls;

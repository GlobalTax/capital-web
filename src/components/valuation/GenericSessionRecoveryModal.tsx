import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Building2, TrendingUp } from 'lucide-react';
import { RecoveredSessionData } from '@/hooks/useSessionRecovery';

// ============= TYPES =============
export interface GenericSessionRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: RecoveredSessionData;
  onContinue: () => void;
  onStartFresh: () => void;
  
  // Customization
  title?: string;
  description?: string;
  continueButtonText?: string;
  startFreshButtonText?: string;
  
  // State
  isLoading?: boolean;
}

// ============= HELPER FUNCTIONS =============
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'hace unos segundos';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
  return `hace ${Math.floor(seconds / 86400)} días`;
};

// ============= COMPONENT =============
export const GenericSessionRecoveryModal: React.FC<GenericSessionRecoveryModalProps> = ({
  open,
  onOpenChange,
  sessionData,
  onContinue,
  onStartFresh,
  title = '¿Continuar tu valoración?',
  description,
  continueButtonText = 'Continuar valoración',
  startFreshButtonText = 'Empezar de nuevo',
  isLoading = false
}) => {
  const defaultDescription = `Detectamos que iniciaste una valoración ${getTimeAgo(sessionData.metadata.created_at)} y no la completaste. ¿Quieres continuar donde lo dejaste?`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]"
        aria-describedby="session-recovery-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription 
            id="session-recovery-description"
            className="text-base pt-2"
          >
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Company Information */}
          {sessionData.companyData.companyName && (
            <div 
              className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border"
              role="region"
              aria-label="Información de la empresa"
            >
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  {sessionData.companyData.companyName}
                </p>
                {sessionData.companyData.contactName && (
                  <p className="text-sm text-muted-foreground">
                    {sessionData.companyData.contactName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress Information */}
          <div 
            className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border"
            role="region"
            aria-label="Progreso de la valoración"
          >
            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                Progreso: {sessionData.metadata.completion_percentage}%
              </p>
              <p className="text-sm text-muted-foreground">
                Paso {sessionData.metadata.current_step} de 3
              </p>
              
              {/* Progress Bar */}
              <div 
                className="mt-2 h-2 bg-muted rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={sessionData.metadata.completion_percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso: ${sessionData.metadata.completion_percentage}%`}
              >
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${sessionData.metadata.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Time Spent (if available) */}
          {sessionData.metadata.time_spent && sessionData.metadata.time_spent > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Tiempo invertido: {Math.floor(sessionData.metadata.time_spent / 60)} minutos
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onStartFresh}
            className="w-full sm:w-auto"
            disabled={isLoading}
            aria-label={startFreshButtonText}
          >
            {startFreshButtonText}
          </Button>
          <Button
            onClick={onContinue}
            className="w-full sm:w-auto"
            disabled={isLoading}
            aria-label={continueButtonText}
          >
            {isLoading ? 'Cargando...' : continueButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

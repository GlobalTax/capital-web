import React, { useEffect, useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { CompanyData } from '@/types/valuation';

interface SessionRecoveryData {
  token: string;
  data: CompanyData;
  created_at: string;
  current_step: number;
  completion_percentage: number;
}

interface SessionRecoveryModalProps {
  onContinue: (data: SessionRecoveryData) => void;
  onStartFresh: () => void;
}

const STORAGE_KEY = 'valuation_v4_token';
const TOKEN_TTL = 48 * 60 * 60 * 1000; // 48 hours

export const SessionRecoveryModal: React.FC<SessionRecoveryModalProps> = ({
  onContinue,
  onStartFresh
}) => {
  const [open, setOpen] = useState(false);
  const [sessionData, setSessionData] = useState<SessionRecoveryData | null>(null);
  const [loading, setLoading] = useState(true);

  // Calcular tiempo transcurrido
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'hace unos segundos';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
    return `hace ${Math.floor(seconds / 86400)} días`;
  };

  useEffect(() => {
    const checkForExistingSession = async () => {
      try {
        // Buscar token en localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setLoading(false);
          return;
        }

        const data = JSON.parse(stored);
        const now = Date.now();

        // Verificar que no haya expirado
        if (!data.token || !data.timestamp || (now - data.timestamp) >= TOKEN_TTL) {
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
          return;
        }

        // Buscar valoración en base de datos
        const { data: valuation, error } = await supabase
          .from('company_valuations')
          .select('*')
          .eq('unique_token', data.token)
          .is('final_valuation', null) // Solo si no está completada
          .single();

        if (error || !valuation) {
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
          return;
        }

        // Verificar que tenga datos significativos (no solo un token vacío)
        if (!valuation.contact_name && !valuation.email && !valuation.company_name) {
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
          return;
        }

        // Construir datos de recuperación
        const recoveryData: SessionRecoveryData = {
          token: data.token,
          data: {
            contactName: valuation.contact_name || '',
            companyName: valuation.company_name || '',
            cif: valuation.cif || '',
            email: valuation.email || '',
            phone: valuation.phone || '',
            phone_e164: valuation.phone_e164 || '',
            whatsapp_opt_in: valuation.whatsapp_opt_in ?? true,
            industry: valuation.industry || '',
            activityDescription: valuation.activity_description || '',
            employeeRange: valuation.employee_range || '',
            revenue: valuation.revenue || 0,
            ebitda: valuation.ebitda || 0,
            hasAdjustments: valuation.has_adjustments ?? false,
            adjustmentAmount: valuation.adjustment_amount || 0,
            location: valuation.location || '',
            ownershipParticipation: valuation.ownership_participation || '',
            competitiveAdvantage: valuation.competitive_advantage || ''
          },
          created_at: valuation.created_at,
          current_step: valuation.current_step || 1,
          completion_percentage: valuation.completion_percentage || 0
        };

        setSessionData(recoveryData);
        setOpen(true);
        setLoading(false);

        console.log('✅ Sesión previa encontrada:', {
          token: data.token,
          company: valuation.company_name,
          step: valuation.current_step,
          completion: valuation.completion_percentage
        });
      } catch (error) {
        console.error('Error checking for existing session:', error);
        localStorage.removeItem(STORAGE_KEY);
        setLoading(false);
      }
    };

    checkForExistingSession();
  }, []);

  const handleContinue = () => {
    if (sessionData) {
      onContinue(sessionData);
      setOpen(false);
    }
  };

  const handleStartFresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    onStartFresh();
    setOpen(false);
  };

  if (loading || !sessionData) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-primary" />
            ¿Continuar tu valoración?
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Detectamos que iniciaste una valoración {getTimeAgo(sessionData.created_at)} 
            {' '}y no la completaste. ¿Quieres continuar donde lo dejaste?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información de la empresa */}
          {sessionData.data.companyName && (
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  {sessionData.data.companyName}
                </p>
                {sessionData.data.contactName && (
                  <p className="text-sm text-muted-foreground">
                    {sessionData.data.contactName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progreso */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                Progreso: {sessionData.completion_percentage}%
              </p>
              <p className="text-sm text-muted-foreground">
                Paso {sessionData.current_step} de 3
              </p>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${sessionData.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleStartFresh}
            className="w-full sm:w-auto"
          >
            Empezar de nuevo
          </Button>
          <Button
            onClick={handleContinue}
            className="w-full sm:w-auto"
          >
            Continuar valoración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

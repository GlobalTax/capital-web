import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useValuationDetail } from '@/hooks/useValuationDetail';
import { useV4LinkSender } from '@/hooks/useV4LinkSender';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  ArrowLeft, 
  Copy, 
  FileText, 
  Trash2, 
  Play,
  Download,
  Building2,
  TrendingUp,
  Calendar
} from 'lucide-react';

export const ValoracionDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendV4Link, isLoading: isSendingV4 } = useV4LinkSender();

  const { data: valuation, isLoading, error } = useValuationDetail(id!, user?.id);

  const handleResume = () => {
    if (valuation?.unique_token) {
      navigate(`/lp/calculadora?token=${valuation.unique_token}`);
    }
  };

  const handleContinue = () => {
    if (valuation?.unique_token) {
      navigate(`/lp/calculadora?token=${valuation.unique_token}`);
    }
  };

  const handleDownloadPDF = async () => {
    if (!valuation) return;

    try {
      const { downloadValuationPDF } = await import('@/utils/pdfManager');
      
      await downloadValuationPDF({
        valuationId: valuation.id,
        pdfType: 'auto', // Decidirá automáticamente el mejor método
        userId: user?.id,
        language: 'es'
      });

      toast({ 
        title: "PDF descargado", 
        description: "El informe se ha descargado correctamente" 
      });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async () => {
    if (!valuation) return;

    try {
      const { data, error } = await supabase.functions.invoke('duplicate-valuation', {
        body: { valuationId: valuation.id }
      });

      if (error) throw error;

      if (data?.success && data?.token) {
        toast({
          title: "Valoración duplicada",
          description: "Redirigiendo a la calculadora...",
        });
        navigate(`/lp/calculadora?token=${data.token}`);
      }
    } catch (error: any) {
      console.error('Error duplicating valuation:', error);
      toast({
        title: "Error",
        description: "No se pudo duplicar la valoración",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!valuation || !confirm('¿Estás seguro de que deseas eliminar esta valoración?')) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('delete-valuation', {
        body: { valuationId: valuation.id }
      });

      if (error) throw error;

      toast({
        title: "Valoración eliminada",
        description: "La valoración ha sido eliminada correctamente",
      });

      navigate('/perfil/valoraciones');
    } catch (error: any) {
      console.error('Error deleting valuation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la valoración",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success border-success/30';
      case 'in_progress':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'started':
        return 'bg-info/20 text-info border-info/30';
      default:
        return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En progreso';
      case 'started':
        return 'Iniciada';
      default:
        return status || 'Sin estado';
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !valuation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold mb-2">Valoración no encontrada</h2>
        <p className="text-sm text-muted-foreground mb-4">No se pudo cargar la valoración solicitada</p>
        <Button size="sm" onClick={() => navigate('/perfil/valoraciones')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  const isInProgress = valuation.valuation_status === 'in_progress' || valuation.valuation_status === 'started';
  const isCompleted = valuation.valuation_status === 'completed';

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/perfil/valoraciones')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{valuation.company_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(valuation.valuation_status)} variant="outline">
                {getStatusLabel(valuation.valuation_status)}
              </Badge>
              {valuation.industry && (
                <span className="text-xs text-muted-foreground">{valuation.industry}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isInProgress && (
            <Button size="sm" onClick={handleContinue}>
              <Play className="h-4 w-4 mr-2" />
              Continuar
            </Button>
          )}
          
          {isCompleted && (
            <Button variant="outline" size="sm" onClick={handleResume}>
              <Play className="h-4 w-4 mr-2" />
              Reanudar
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Cards principales minimalistas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Información Básica</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Empresa</p>
              <p className="text-sm font-medium">{valuation.company_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sector</p>
              <p className="text-sm font-medium">{valuation.industry || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Empleados</p>
              <p className="text-sm font-medium">{valuation.employee_range || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Datos Financieros</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Facturación</p>
              <p className="text-sm font-semibold">{formatCurrency(valuation.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">EBITDA</p>
              <p className="text-sm font-semibold">{formatCurrency(valuation.ebitda)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valoración Final</p>
              <p className="text-sm font-bold text-primary">{formatCurrency(valuation.final_valuation)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Fechas</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Creada</p>
              <p className="text-sm font-medium">{formatDate(valuation.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Última actividad</p>
              <p className="text-sm font-medium">
                {valuation.last_activity_at ? formatDate(valuation.last_activity_at) : formatDate(valuation.created_at)}
              </p>
            </div>
            {valuation.completion_percentage && (
              <div>
                <p className="text-xs text-muted-foreground">Progreso</p>
                <p className="text-sm font-medium">{valuation.completion_percentage}%</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Ventaja competitiva si existe */}
      {valuation.competitive_advantage && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Ventaja Competitiva</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {valuation.competitive_advantage}
          </p>
        </Card>
      )}

      {/* Histórico básico */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Línea de Tiempo</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Creada el</span>
            <span className="font-medium">{formatDate(valuation.created_at)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Última actividad</span>
            <span className="font-medium">
              {valuation.last_activity_at ? formatDate(valuation.last_activity_at) : formatDate(valuation.created_at)}
            </span>
          </div>
          {isCompleted && valuation.form_submitted_at && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Completada el</span>
              <span className="font-medium text-success">{formatDate(valuation.form_submitted_at)}</span>
            </div>
          )}
          {valuation.time_spent_seconds && valuation.time_spent_seconds > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tiempo invertido</span>
              <span className="font-medium">{Math.round(valuation.time_spent_seconds / 60)} min</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ValoracionDetallePage;
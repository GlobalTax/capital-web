import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ValuationCalculatorV4 from '@/components/ValuationCalculatorV4';
import { CompanyDataV4 } from '@/types/valuationV4';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CalculadoraValoracionV4 = () => {
  const { clientId } = useParams();
  const [companyData, setCompanyData] = useState<CompanyDataV4 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!clientId) {
        setError('Token no válido');
        setLoading(false);
        return;
      }

      try {
        // Obtener datos vía Edge Function protegida
        const { data: payload, error: funcError } = await supabase.functions.invoke('get-valuation-v4', {
          body: { token: clientId }
        });

        if (funcError || !payload?.companyData) {
          setError('Valoración no encontrada o enlace expirado');
          setLoading(false);
          return;
        }

        const mappedData: CompanyDataV4 = payload.companyData;
        setCompanyData(mappedData);

      } catch (err) {
        console.error('Error loading company data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
            <p className="text-muted-foreground">
              Preparando tu simulador personalizado
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Enlace Inválido</h2>
            <p className="text-muted-foreground">
              {error || 'Este enlace no es válido o ha expirado. Contacta con tu asesor para obtener un nuevo enlace.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ValuationCalculatorV4 companyData={companyData} />;
};

export default CalculadoraValoracionV4;
import React from 'react';
import { useParams } from 'react-router-dom';
import ValuationCalculatorV3 from '@/components/ValuationCalculatorV3';
import { CompanyDataV3 } from '@/types/valuationV3';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Datos de ejemplo - en producción vendrían de la base de datos por ID/slug
const mockCompanyData: CompanyDataV3 = {
  contactName: 'Juan Pérez',
  companyName: 'TechSolutions S.L.',
  email: 'juan.perez@techsolutions.es',
  phone: '600 000 000',
  industry: 'tecnologia',
  revenue: 2500000,
  ebitda: 350000,
  baseValuation: 1400000
};

const CalculadoraValoracionV3 = () => {
  const { clientId } = useParams();
  
  // TODO: En producción, cargar datos del cliente desde Supabase
  // const [companyData, setCompanyData] = useState<CompanyDataV3 | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const loadClientData = async () => {
  //     try {
  //       setLoading(true);
  //       const { data, error } = await supabase
  //         .from('client_valuations')
  //         .select('*')
  //         .eq('client_id', clientId)
  //         .single();
  //       
  //       if (error) throw error;
  //       setCompanyData(data);
  //     } catch (err) {
  //       setError('No se pudieron cargar los datos del cliente');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //   if (clientId) {
  //     loadClientData();
  //   }
  // }, [clientId]);

  // if (loading) {
  //   return <LoadingState />;
  // }

  // if (error || !companyData) {
  //   return <ErrorState message={error} />;
  // }

  // Por ahora usar datos mock
  if (!clientId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Enlace Inválido</h2>
            <p className="text-muted-foreground">
              Este enlace no es válido o ha expirado. Contacta con tu asesor para obtener un nuevo enlace.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ValuationCalculatorV3 companyData={mockCompanyData} />;
};

export default CalculadoraValoracionV3;
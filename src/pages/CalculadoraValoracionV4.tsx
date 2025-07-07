import React from 'react';
import { useParams } from 'react-router-dom';
import ValuationCalculatorV4 from '@/components/ValuationCalculatorV4';
import { CompanyDataV4 } from '@/types/valuationV4';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Datos de ejemplo - en producción vendrían de la base de datos por ID/slug
const mockCompanyData: CompanyDataV4 = {
  contactName: 'Ana García',
  companyName: 'InnovateTech Solutions S.L.',
  email: 'ana.garcia@innovatetech.es',
  phone: '+34 650 000 000',
  industry: 'tecnologia',
  revenue: 3200000,
  ebitda: 480000,
  baseValuation: 1920000
};

const CalculadoraValoracionV4 = () => {
  const { clientId } = useParams();
  
  // TODO: En producción, cargar datos del cliente desde Supabase
  // const [companyData, setCompanyData] = useState<CompanyDataV4 | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

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

  return <ValuationCalculatorV4 companyData={mockCompanyData} />;
};

export default CalculadoraValoracionV4;
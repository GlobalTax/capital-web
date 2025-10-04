import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, normalizeValuationAmount } from '@/utils/formatters';
import { isRecentOperation } from '@/utils/dateHelpers';
import { Building2, TrendingUp, Users, Calendar, ArrowRight, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency?: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  created_at?: string;
}

interface OperationDetailsModalProps {
  operation: Operation;
  isOpen: boolean;
  onClose: () => void;
}

const OperationDetailsModal: React.FC<OperationDetailsModalProps> = ({ operation, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleRequestInfo = () => {
    const params = new URLSearchParams({
      ref: 'marketplace',
      operation: operation.id,
      company: operation.company_name,
    });
    navigate(`/contacto?${params.toString()}`);
  };

  const calculateEbitdaMultiple = () => {
    if (operation.ebitda_amount && operation.valuation_amount) {
      const multiple = normalizeValuationAmount(operation.valuation_amount) / normalizeValuationAmount(operation.ebitda_amount);
      return multiple.toFixed(2);
    }
    return null;
  };

  const ebitdaMultiple = calculateEbitdaMultiple();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          {/* Logo/Company Initial */}
          <div className="flex items-center space-x-4 mb-4">
            {operation.logo_url ? (
              <img 
                src={operation.logo_url} 
                alt={`${operation.company_name} logo`}
                className="w-16 h-16 rounded-lg object-contain bg-muted p-2"
              />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">
                  {operation.company_name.split(' ').map(word => word[0]).join('').substring(0, 2)}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{operation.company_name}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {operation.is_featured && (
                  <Badge variant="secondary">Destacado</Badge>
                )}
                {isRecentOperation(operation.created_at) && (
                  <Badge className="bg-green-500 hover:bg-green-600">Nuevo</Badge>
                )}
                <Badge variant="outline">{operation.sector}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Financial Information Card */}
        <div className="bg-muted rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Información Financiera
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Valoración</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(normalizeValuationAmount(operation.valuation_amount), operation.valuation_currency || 'EUR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Facturación</p>
              <p className="text-xl font-bold text-green-600">
                {operation.revenue_amount 
                  ? formatCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency || 'EUR')
                  : 'Consultar'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">EBITDA</p>
              <p className="text-xl font-bold text-blue-600">
                {operation.ebitda_amount 
                  ? formatCurrency(normalizeValuationAmount(operation.ebitda_amount), operation.valuation_currency || 'EUR')
                  : 'Consultar'
                }
              </p>
            </div>
            {ebitdaMultiple && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Múltiplo EBITDA</p>
                <p className="text-xl font-bold text-purple-600">{ebitdaMultiple}x</p>
              </div>
            )}
          </div>
        </div>

        {/* Operation Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="flex items-start space-x-2">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Sector</p>
              <p className="text-sm font-medium">{operation.sector}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Año</p>
              <p className="text-sm font-medium">{operation.year}</p>
            </div>
          </div>
          {operation.deal_type && (
            <div className="flex items-start space-x-2">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Operación</p>
                <p className="text-sm font-medium">
                  {operation.deal_type === 'sale' ? 'Venta' : 'Adquisición'}
                </p>
              </div>
            </div>
          )}
          {(operation.company_size_employees || operation.company_size) && (
            <div className="flex items-start space-x-2">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Empleados</p>
                <p className="text-sm font-medium">{operation.company_size_employees || operation.company_size}</p>
              </div>
            </div>
          )}
        </div>

        {/* Full Description */}
        <div className="py-4 border-t">
          <h3 className="text-lg font-semibold mb-3">Sobre la Empresa</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {operation.description}
          </p>
        </div>

        {/* Highlights */}
        {operation.highlights && operation.highlights.length > 0 && (
          <div className="py-4 border-t">
            <h3 className="text-lg font-semibold mb-3">Aspectos Destacados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {operation.highlights.map((highlight, index) => (
                <div 
                  key={index}
                  className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                >
                  <span className="mr-2">✓</span>
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Footer */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            Cerrar
          </Button>
          <Button onClick={handleRequestInfo} className="sm:flex-1">
            Solicitar Información
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OperationDetailsModal;

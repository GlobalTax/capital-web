import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, normalizeValuationAmount } from '@/utils/formatters';
import { isRecentOperation } from '@/utils/dateHelpers';
import { Building2, TrendingUp, Users, Calendar, ArrowRight, Briefcase, MapPin, Edit, History, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  subsector?: string;
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
  status?: string;
  display_locations?: string[];
  created_at?: string;
  updated_at?: string;
}

interface OperationDetailsModalEnhancedProps {
  operation: Operation;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

const OperationDetailsModalEnhanced: React.FC<OperationDetailsModalEnhancedProps> = ({ 
  operation, 
  isOpen, 
  onClose,
  onEdit 
}) => {
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

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'under_negotiation': return 'En Negociación';
      case 'sold': return 'Vendida';
      case 'withdrawn': return 'Retirada';
      default: return 'Sin Estado';
    }
  };

  const getDealTypeText = (dealType?: string) => {
    switch (dealType) {
      case 'sale': return 'Venta';
      case 'acquisition': return 'Adquisición';
      case 'merger': return 'Fusión';
      case 'restructuring': return 'Reestructuración';
      default: return 'No Definido';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Logo/Company Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
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
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Destacado</Badge>
                  )}
                  {isRecentOperation(operation.created_at) && (
                    <Badge className="bg-green-500 hover:bg-green-600">Nuevo</Badge>
                  )}
                  <Badge variant="outline">{operation.sector}</Badge>
                  {operation.subsector && (
                    <Badge variant="outline" className="text-xs">{operation.subsector}</Badge>
                  )}
                </div>
              </div>
            </div>

            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Tabs Content */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Building2 className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="financial">
              <TrendingUp className="h-4 w-4 mr-2" />
              Financiero
            </TabsTrigger>
            <TabsTrigger value="marketing">
              <BarChart3 className="h-4 w-4 mr-2" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            {/* Operation Details Grid */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        <p className="text-sm font-medium">{getDealTypeText(operation.deal_type)}</p>
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
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Sobre la Empresa</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {operation.description}
                </p>
              </CardContent>
            </Card>

            {/* Highlights */}
            {operation.highlights && operation.highlights.length > 0 && (
              <Card>
                <CardContent className="pt-6">
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4 mt-4">
            <Card className="bg-muted border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Información Financiera
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Ubicaciones de Visualización
                </h3>
                <div className="flex flex-wrap gap-2">
                  {operation.display_locations && operation.display_locations.length > 0 ? (
                    operation.display_locations.map((location, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {location === 'home' ? '🏠 Inicio' : location === 'operaciones' ? '📊 Operaciones' : location}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No hay ubicaciones configuradas</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Estado de Marketing</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <Badge className={operation.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {getStatusText(operation.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Activa</span>
                    <Badge variant={operation.is_active ? "default" : "secondary"}>
                      {operation.is_active ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Destacada</span>
                    <Badge variant={operation.is_featured ? "default" : "secondary"}>
                      {operation.is_featured ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Historial de Cambios</h3>
                <div className="space-y-3">
                  {operation.created_at && (
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Operación creada</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(operation.created_at).toLocaleString('es-ES', {
                            dateStyle: 'long',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {operation.updated_at && operation.updated_at !== operation.created_at && (
                    <div className="flex items-start gap-3 pb-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Última actualización</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(operation.updated_at).toLocaleString('es-ES', {
                            dateStyle: 'long',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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

export default OperationDetailsModalEnhanced;

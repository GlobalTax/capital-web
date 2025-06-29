
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Mail, Phone, Building2, TrendingUp, Calendar, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ValuationLead {
  id: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone?: string;
  industry: string;
  employee_range: string;
  revenue?: number;
  ebitda?: number;
  final_valuation?: number;
  ebitda_multiple_used?: number;
  location?: string;
  years_of_operation?: number;
  created_at: string;
  ip_address?: unknown;
}

const ValuationLeadsManager = () => {
  const [valuations, setValuations] = useState<ValuationLead[]>([]);
  const [filteredValuations, setFilteredValuations] = useState<ValuationLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedValuation, setSelectedValuation] = useState<ValuationLead | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchValuations();
  }, []);

  useEffect(() => {
    filterValuations();
  }, [valuations, searchTerm, selectedIndustry]);

  const fetchValuations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching valuations:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las valoraciones",
          variant: "destructive",
        });
        return;
      }

      setValuations(data || []);
    } catch (error) {
      console.error('Error fetching valuations:', error);
      toast({
        title: "Error",
        description: "Error al conectar con la base de datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterValuations = () => {
    let filtered = valuations;

    if (searchTerm) {
      filtered = filtered.filter(valuation =>
        valuation.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        valuation.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        valuation.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(valuation => valuation.industry === selectedIndustry);
    }

    setFilteredValuations(filtered);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIndustries = () => {
    const industries = [...new Set(valuations.map(v => v.industry))];
    return industries.sort();
  };

  const getValuationBadgeColor = (valuation?: number) => {
    if (!valuation) return 'bg-gray-100 text-gray-800';
    if (valuation >= 10000000) return 'bg-green-100 text-green-800';
    if (valuation >= 5000000) return 'bg-blue-100 text-blue-800';
    if (valuation >= 1000000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Valoraciones de Empresas</h1>
          <p className="text-gray-600">
            Gestiona las solicitudes de valoración ({filteredValuations.length} total)
          </p>
        </div>
        <Button onClick={fetchValuations} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Valoraciones</p>
                <p className="text-xl font-semibold">{valuations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Euro className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Valoración Promedio</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(valuations.reduce((acc, v) => acc + (v.final_valuation || 0), 0) / valuations.filter(v => v.final_valuation).length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Múltiple Promedio</p>
                <p className="text-xl font-semibold">
                  {(valuations.reduce((acc, v) => acc + (v.ebitda_multiple_used || 0), 0) / valuations.filter(v => v.ebitda_multiple_used).length).toFixed(1)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-xl font-semibold">
                  {valuations.filter(v => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(v.created_at) > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, empresa o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sectores</SelectItem>
            {getIndustries().map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Valoraciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Valoración</TableHead>
                  <TableHead>EBITDA</TableHead>
                  <TableHead>Múltiple</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValuations.map((valuation) => (
                  <TableRow key={valuation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{valuation.contact_name}</p>
                        <p className="text-sm text-gray-500">{valuation.email}</p>
                        {valuation.phone && (
                          <p className="text-sm text-gray-500">{valuation.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{valuation.company_name}</p>
                        <p className="text-sm text-gray-500">{valuation.employee_range}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{valuation.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getValuationBadgeColor(valuation.final_valuation)}>
                        {formatCurrency(valuation.final_valuation)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(valuation.ebitda)}
                    </TableCell>
                    <TableCell>
                      {valuation.ebitda_multiple_used ? `${valuation.ebitda_multiple_used}x` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatDate(valuation.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedValuation(valuation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalles de Valoración</DialogTitle>
                            </DialogHeader>
                            {selectedValuation && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Información de Contacto</h4>
                                    <p><strong>Nombre:</strong> {selectedValuation.contact_name}</p>
                                    <p><strong>Email:</strong> {selectedValuation.email}</p>
                                    {selectedValuation.phone && <p><strong>Teléfono:</strong> {selectedValuation.phone}</p>}
                                    {selectedValuation.location && <p><strong>Ubicación:</strong> {selectedValuation.location}</p>}
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Información de la Empresa</h4>
                                    <p><strong>Empresa:</strong> {selectedValuation.company_name}</p>
                                    <p><strong>Sector:</strong> {selectedValuation.industry}</p>
                                    <p><strong>Empleados:</strong> {selectedValuation.employee_range}</p>
                                    {selectedValuation.years_of_operation && <p><strong>Años operando:</strong> {selectedValuation.years_of_operation}</p>}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Datos Financieros</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <p><strong>Facturación:</strong> {formatCurrency(selectedValuation.revenue)}</p>
                                    <p><strong>EBITDA:</strong> {formatCurrency(selectedValuation.ebitda)}</p>
                                    <p><strong>Valoración Final:</strong> {formatCurrency(selectedValuation.final_valuation)}</p>
                                    <p><strong>Múltiple Usado:</strong> {selectedValuation.ebitda_multiple_used ? `${selectedValuation.ebitda_multiple_used}x` : 'N/A'}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Información Técnica</h4>
                                  <p><strong>Fecha de solicitud:</strong> {formatDate(selectedValuation.created_at)}</p>
                                  {selectedValuation.ip_address && <p><strong>IP:</strong> {String(selectedValuation.ip_address)}</p>}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`mailto:${valuation.email}`, '_blank')}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        
                        {valuation.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`tel:${valuation.phone}`, '_blank')}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredValuations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron valoraciones</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValuationLeadsManager;

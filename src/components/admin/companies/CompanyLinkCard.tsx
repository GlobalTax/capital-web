import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Search, 
  Plus, 
  ExternalLink, 
  Unlink,
  TrendingUp,
  Users,
  MapPin,
  Globe,
  Euro,
  Percent,
  CreditCard,
  Wallet,
  Edit
} from 'lucide-react';
import { CompanySearchDialog } from './CompanySearchDialog';
import { CompanyFormDialog } from './CompanyFormDialog';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';
import { formatCompactCurrency } from '@/shared/utils/format';

interface CompanyLinkCardProps {
  contactId: string;
  contactOrigin: string;
  empresaId?: string | null;
  companyName?: string;
  onCompanyLinked: () => void;
}

export const CompanyLinkCard: React.FC<CompanyLinkCardProps> = ({
  contactId,
  contactOrigin,
  empresaId,
  companyName,
  onCompanyLinked,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { linkToContact, unlinkFromContact } = useEmpresas();

  // Fetch linked empresa
  const { data: empresa, isLoading, refetch } = useQuery({
    queryKey: ['empresa-detail', empresaId],
    queryFn: async () => {
      if (!empresaId) return null;
      
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .maybeSingle();

      if (error) throw error;
      return data as Empresa | null;
    },
    enabled: !!empresaId,
  });

  // Only show for contact and valuation origins
  const supportsCompanyLink = contactOrigin === 'contact' || contactOrigin === 'valuation';
  
  if (!supportsCompanyLink) {
    return null;
  }

  const handleLink = async (selectedEmpresa: Empresa) => {
    await linkToContact(selectedEmpresa.id, contactId, contactOrigin);
    setIsSearchOpen(false);
    onCompanyLinked();
    refetch();
  };

  const handleUnlink = async () => {
    if (confirm('¿Desvincular esta empresa del contacto?')) {
      await unlinkFromContact(contactId, contactOrigin);
      onCompanyLinked();
    }
  };

  const handleCreate = (createdEmpresa: Empresa) => {
    linkToContact(createdEmpresa.id, contactId, contactOrigin);
    setIsFormOpen(false);
    onCompanyLinked();
  };

  const handleUpdate = () => {
    setIsEditing(false);
    refetch();
    onCompanyLinked();
  };

  const calculateMargin = () => {
    if (!empresa?.ebitda || !empresa?.facturacion) return null;
    return ((empresa.ebitda / empresa.facturacion) * 100).toFixed(1);
  };

  const margin = calculateMargin();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Empresa Vinculada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No empresa linked
  if (!empresa) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                No hay empresa vinculada a este contacto
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar empresa existente
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear nueva empresa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <CompanySearchDialog
          open={isSearchOpen}
          onOpenChange={setIsSearchOpen}
          onSelect={handleLink}
          initialSearch={companyName}
        />

        <CompanyFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleCreate}
          initialData={{ nombre: companyName || '' }}
        />
      </>
    );
  }

  // Empresa linked - show details
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresa Vinculada
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleUnlink}
              >
                <Unlink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Header con nombre y badges */}
          <div>
            <h3 className="text-lg font-semibold">{empresa.nombre}</h3>
            {empresa.cif && (
              <p className="text-sm text-muted-foreground">CIF: {empresa.cif}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline">{empresa.sector}</Badge>
              {empresa.subsector && (
                <Badge variant="secondary">{empresa.subsector}</Badge>
              )}
              {empresa.es_target && (
                <Badge className="bg-green-100 text-green-800">Target</Badge>
              )}
              {empresa.potencial_search_fund && (
                <Badge className="bg-purple-100 text-purple-800">SF Potencial</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Métricas financieras */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Facturación</p>
                <p className="text-sm font-medium">
                  {empresa.facturacion 
                    ? formatCompactCurrency(empresa.facturacion) 
                    : '-'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">EBITDA</p>
                <p className="text-sm font-medium">
                  {empresa.ebitda 
                    ? formatCompactCurrency(empresa.ebitda) 
                    : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Percent className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Margen EBITDA</p>
                <p className="text-sm font-medium">
                  {margin ? `${margin}%` : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Empleados</p>
                <p className="text-sm font-medium">
                  {empresa.empleados ?? '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Deuda</p>
                <p className="text-sm font-medium">
                  {empresa.deuda 
                    ? formatCompactCurrency(empresa.deuda) 
                    : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Capital Circulante</p>
                <p className="text-sm font-medium">
                  {empresa.capital_circulante 
                    ? formatCompactCurrency(empresa.capital_circulante) 
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Ubicación y web */}
          {(empresa.ubicacion || empresa.sitio_web) && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-4 text-sm">
                {empresa.ubicacion && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{empresa.ubicacion}</span>
                  </div>
                )}
                {empresa.sitio_web && (
                  <a 
                    href={empresa.sitio_web.startsWith('http') ? empresa.sitio_web : `https://${empresa.sitio_web}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-3 w-3" />
                    <span>{empresa.sitio_web.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CompanyFormDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        onSuccess={handleUpdate}
        empresa={empresa}
      />
    </>
  );
};

// =============================================
// CORPORATE BUYER DETAIL PAGE
// =============================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Globe, 
  Building2, 
  Users, 
  Edit2, 
  Trash2,
  ExternalLink,
  MapPin,
  Target,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCorporateBuyer, useDeleteCorporateBuyer } from '@/hooks/useCorporateBuyers';
import { useCorporateContacts } from '@/hooks/useCorporateContacts';
import { useIsCorporateFavorite, useToggleCorporateFavorite } from '@/hooks/useCorporateFavorites';
import { 
  BUYER_TYPE_LABELS, 
  BUYER_TYPE_COLORS,
  CONTACT_ROLE_LABELS 
} from '@/types/corporateBuyers';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number | null) => {
  if (!value) return null;
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
  return `€${value}`;
};

const CorporateBuyerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: buyer, isLoading } = useCorporateBuyer(isNew ? undefined : id);
  const { data: contacts = [] } = useCorporateContacts(isNew ? undefined : id);
  const { data: isFavorite = false } = useIsCorporateFavorite('buyer', id || '');
  const toggleFavorite = useToggleCorporateFavorite();
  const deleteBuyer = useDeleteCorporateBuyer();

  const handleToggleFavorite = () => {
    if (id) {
      toggleFavorite.mutate({ entityType: 'buyer', entityId: id, isFavorite });
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteBuyer.mutate(id, {
        onSuccess: () => navigate('/admin/corporate-buyers'),
      });
    }
  };

  if (isNew) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Nuevo Comprador</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Formulario de creación en desarrollo...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="text-center text-muted-foreground">
          Comprador no encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{buyer.name}</h1>
              {buyer.buyer_type && (
                <Badge className={cn("text-xs", BUYER_TYPE_COLORS[buyer.buyer_type])}>
                  {BUYER_TYPE_LABELS[buyer.buyer_type]}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              {buyer.country_base && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {buyer.country_base}
                </span>
              )}
              {buyer.website && (
                <a 
                  href={buyer.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Globe className="h-3 w-3" />
                  Web
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleFavorite}
          >
            <Star className={cn(
              "h-4 w-4",
              isFavorite ? "fill-yellow-400 text-yellow-400" : ""
            )} />
          </Button>
          <Button variant="outline" size="icon">
            <Edit2 className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar comprador?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará el comprador y todos sus contactos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {buyer.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{buyer.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Investment Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Criterios de Inversión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {buyer.investment_thesis && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Tesis de Inversión</h4>
                  <p className="text-sm text-muted-foreground">{buyer.investment_thesis}</p>
                </div>
              )}

              {buyer.sector_focus && buyer.sector_focus.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Sectores Objetivo</h4>
                  <div className="flex flex-wrap gap-1">
                    {buyer.sector_focus.map((sector) => (
                      <Badge key={sector} variant="secondary" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {buyer.geography_focus && buyer.geography_focus.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Geografía</h4>
                  <div className="flex flex-wrap gap-1">
                    {buyer.geography_focus.map((geo) => (
                      <Badge key={geo} variant="outline" className="text-xs">
                        {geo}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Ranges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Rangos Financieros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-xs text-muted-foreground mb-1">Facturación</h4>
                  <p className="text-sm font-medium">
                    {formatCurrency(buyer.revenue_min) || '—'} - {formatCurrency(buyer.revenue_max) || '—'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-muted-foreground mb-1">EBITDA</h4>
                  <p className="text-sm font-medium">
                    {formatCurrency(buyer.ebitda_min) || '—'} - {formatCurrency(buyer.ebitda_max) || '—'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-muted-foreground mb-1">Ticket</h4>
                  <p className="text-sm font-medium">
                    {formatCurrency(buyer.deal_size_min) || '—'} - {formatCurrency(buyer.deal_size_max) || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Contacts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contactos ({contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin contactos registrados
                </p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {contact.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{contact.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact.role ? CONTACT_ROLE_LABELS[contact.role] : contact.title || '—'}
                        </p>
                        {contact.email && (
                          <a 
                            href={`mailto:${contact.email}`} 
                            className="text-xs text-primary hover:underline"
                          >
                            {contact.email}
                          </a>
                        )}
                      </div>
                      {contact.is_primary_contact && (
                        <Badge variant="secondary" className="text-xs">Principal</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Separator className="my-4" />
              <Button variant="outline" size="sm" className="w-full">
                + Añadir Contacto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CorporateBuyerDetailPage;

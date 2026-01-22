import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBuySideMandates, BuySideMandate } from '@/hooks/useBuySideMandates';
import { MandateTeaserUpload } from '@/components/admin/buyside/MandateTeaserUpload';
import { BuySideMandateModal } from '@/components/admin/buyside/BuySideMandateModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const formatCurrency = (value: number | null) => {
  if (value === null) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

const BuySideMandateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mandates, isLoading, updateMandate, deleteMandate, toggleActive } = useBuySideMandates();
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const mandate = mandates?.find((m) => m.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!mandate) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Mandato no encontrado</p>
        <Button variant="outline" onClick={() => navigate('/admin/mandatos-compra')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  const handleToggleActive = () => {
    toggleActive.mutate({ id: mandate.id, is_active: !mandate.is_active });
  };

  const handleDelete = () => {
    deleteMandate.mutate(mandate.id, {
      onSuccess: () => navigate('/admin/mandatos-compra'),
    });
  };

  const handleSave = (data: Omit<BuySideMandate, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'teaser_es_url' | 'teaser_es_filename' | 'teaser_es_uploaded_at' | 'teaser_en_url' | 'teaser_en_filename' | 'teaser_en_uploaded_at'>) => {
    updateMandate.mutate({ id: mandate.id, ...data });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/mandatos-compra')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{mandate.title}</h1>
              {mandate.is_new && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Nuevo
                </Badge>
              )}
              <Badge variant={mandate.is_active ? 'default' : 'secondary'}>
                {mandate.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {mandate.sector} {mandate.subsector && `• ${mandate.subsector}`} • {mandate.geographic_scope}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleActive}>
            {mandate.is_active ? (
              <>
                <ToggleRight className="h-4 w-4 mr-2 text-green-600" />
                Activo
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Inactivo
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {mandate.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {mandate.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Financial Criteria */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Criterios Financieros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Facturación</p>
                  <p className="font-medium">
                    {mandate.revenue_min || mandate.revenue_max
                      ? `${formatCurrency(mandate.revenue_min)} - ${formatCurrency(mandate.revenue_max)}`
                      : 'Sin especificar'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">EBITDA</p>
                  <p className="font-medium">
                    {mandate.ebitda_min || mandate.ebitda_max
                      ? `${formatCurrency(mandate.ebitda_min)} - ${formatCurrency(mandate.ebitda_max)}`
                      : 'Sin especificar'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {mandate.requirements && mandate.requirements.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {mandate.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Teasers */}
        <div className="space-y-6">
          <MandateTeaserUpload
            mandateId={mandate.id}
            teaserEs={{
              url: mandate.teaser_es_url,
              filename: mandate.teaser_es_filename,
              uploadedAt: mandate.teaser_es_uploaded_at,
            }}
            teaserEn={{
              url: mandate.teaser_en_url,
              filename: mandate.teaser_en_filename,
              uploadedAt: mandate.teaser_en_uploaded_at,
            }}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <BuySideMandateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mandate={mandate}
        onSave={handleSave}
        isLoading={updateMandate.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mandato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El mandato "{mandate.title}" será eliminado permanentemente.
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
  );
};

export default BuySideMandateDetailPage;

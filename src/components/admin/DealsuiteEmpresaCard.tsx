import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, MapPin, Globe, Users, FileText, 
  ArrowLeft, ExternalLink, Mail, Phone, Briefcase 
} from 'lucide-react';
import type { DealsuiteEmpresa, DealsuiteContacto } from '@/hooks/useDealsuiteEmpresas';
import { useDealsuiteContactos } from '@/hooks/useDealsuiteEmpresas';

interface Props {
  empresa: DealsuiteEmpresa;
  onBack: () => void;
}

export const DealsuiteEmpresaCard = ({ empresa, onBack }: Props) => {
  const { data: contactos } = useDealsuiteContactos(empresa.id);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Volver al directorio
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-4">
              {empresa.imagen_url ? (
                <img src={empresa.imagen_url} alt="" className="w-14 h-14 rounded-lg object-cover border" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg">{empresa.nombre}</CardTitle>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                  {empresa.ubicacion && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {empresa.ubicacion}
                    </span>
                  )}
                  {empresa.tipo_empresa && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" /> {empresa.tipo_empresa}
                    </span>
                  )}
                </div>
                {empresa.parte_de && (
                  <p className="text-xs text-muted-foreground mt-1">Parte de: {empresa.parte_de}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {empresa.descripcion && (
              <div>
                <h4 className="text-sm font-medium mb-1">Acerca de</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{empresa.descripcion}</p>
              </div>
            )}

            {empresa.experiencia_ma.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1.5">Experiencia M&A</h4>
                <div className="flex flex-wrap gap-1.5">
                  {empresa.experiencia_ma.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {empresa.experiencia_sector.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1.5">Sectores</h4>
                <div className="flex flex-wrap gap-1.5">
                  {empresa.experiencia_sector.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {(empresa.tamano_proyectos_min || empresa.tamano_proyectos_max) && (
              <div>
                <h4 className="text-sm font-medium mb-1">Tamaño de proyectos</h4>
                <p className="text-sm text-muted-foreground">
                  {empresa.tamano_proyectos_min ? `€${(empresa.tamano_proyectos_min / 1e6).toFixed(1)}M` : '?'}
                  {' – '}
                  {empresa.tamano_proyectos_max ? `€${(empresa.tamano_proyectos_max / 1e6).toFixed(1)}M` : '?'}
                </p>
              </div>
            )}

            {empresa.enfoque_consultivo && (
              <div>
                <h4 className="text-sm font-medium mb-1">Enfoque consultivo</h4>
                <p className="text-sm text-muted-foreground">{empresa.enfoque_consultivo}</p>
              </div>
            )}

            {empresa.sitio_web && (
              <a 
                href={empresa.sitio_web.startsWith('http') ? empresa.sitio_web : `https://${empresa.sitio_web}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" /> {empresa.sitio_web}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {empresa.deal_ids.length > 0 && (
              <div className="pt-2">
                <Separator className="mb-3" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  {empresa.deal_ids.length} deal{empresa.deal_ids.length !== 1 ? 's' : ''} vinculado{empresa.deal_ids.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {empresa.notas && (
              <div className="pt-2">
                <Separator className="mb-3" />
                <h4 className="text-sm font-medium mb-1">Notas internas</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{empresa.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacts sidebar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Contactos ({contactos?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!contactos?.length ? (
              <p className="text-sm text-muted-foreground">Sin contactos registrados.</p>
            ) : (
              <div className="space-y-3">
                {contactos.map(c => (
                  <div key={c.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                    {c.imagen_url ? (
                      <img src={c.imagen_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {(c.nombre || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.nombre || 'Sin nombre'}</p>
                      {c.cargo && <p className="text-xs text-muted-foreground">{c.cargo}</p>}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5">
                          <Mail className="h-3 w-3" /> {c.email}
                        </a>
                      )}
                      {c.telefono && (
                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Phone className="h-3 w-3" /> {c.telefono}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

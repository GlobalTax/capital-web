import { Building2, Globe, Linkedin, MapPin, Users, Calendar, TrendingUp, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { MNABoutique } from '@/types/mnaBoutique';
import { MNA_BOUTIQUE_STATUS_LABELS, MNA_TIER_LABELS, MNA_SPECIALIZATION_LABELS } from '@/types/mnaBoutique';

interface MNABoutiqueDetailSidebarProps {
  boutique: MNABoutique;
}

export function MNABoutiqueDetailSidebar({ boutique }: MNABoutiqueDetailSidebarProps) {
  const formatDealSize = () => {
    if (!boutique.deal_size_min && !boutique.deal_size_max) return null;
    if (boutique.deal_size_min && boutique.deal_size_max) {
      return `${boutique.deal_size_min}M€ - ${boutique.deal_size_max}M€`;
    }
    if (boutique.deal_size_min) return `>${boutique.deal_size_min}M€`;
    if (boutique.deal_size_max) return `<${boutique.deal_size_max}M€`;
    return null;
  };

  return (
    <div className="w-72 shrink-0 space-y-6 pr-6 border-r">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-normal">{boutique.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={boutique.status === 'active' ? 'default' : 'secondary'}>
                {MNA_BOUTIQUE_STATUS_LABELS[boutique.status]}
              </Badge>
              {boutique.tier && (
                <Badge variant="outline">
                  {MNA_TIER_LABELS[boutique.tier]}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-3">
          {boutique.website && (
            <a 
              href={boutique.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="h-5 w-5" />
            </a>
          )}
          {boutique.linkedin_url && (
            <a 
              href={boutique.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      <Separator />

      {/* Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-normal text-muted-foreground uppercase tracking-wide">Información</h3>
        
        <div className="space-y-3">
          {boutique.country_base && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Sede</p>
                <p className="text-sm">{boutique.country_base}</p>
                {boutique.cities && boutique.cities.length > 0 && (
                  <p className="text-xs text-muted-foreground">{boutique.cities.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {boutique.employee_count && (
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Empleados</p>
                <p className="text-sm">{boutique.employee_count}</p>
                {boutique.employee_count_source && (
                  <p className="text-xs text-muted-foreground">Fuente: {boutique.employee_count_source}</p>
                )}
              </div>
            </div>
          )}

          {boutique.founded_year && (
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Fundación</p>
                <p className="text-sm">{boutique.founded_year}</p>
              </div>
            </div>
          )}

          {formatDealSize() && (
            <div className="flex items-start gap-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Tamaño de deal</p>
                <p className="text-sm">{formatDealSize()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {boutique.specialization && boutique.specialization.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-normal text-muted-foreground uppercase tracking-wide">Especialización</h3>
            <div className="flex flex-wrap gap-1.5">
              {boutique.specialization.map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {MNA_SPECIALIZATION_LABELS[spec as keyof typeof MNA_SPECIALIZATION_LABELS] || spec}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {boutique.sector_focus && boutique.sector_focus.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-normal text-muted-foreground uppercase tracking-wide">Sectores</h3>
            <div className="flex flex-wrap gap-1.5">
              {boutique.sector_focus.map((sector) => (
                <Badge key={sector} variant="secondary" className="text-xs">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {boutique.description && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-normal text-muted-foreground uppercase tracking-wide">Descripción</h3>
            <p className="text-sm text-muted-foreground">{boutique.description}</p>
          </div>
        </>
      )}

      {boutique.notes_internal && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-normal text-muted-foreground uppercase tracking-wide">Notas internas</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{boutique.notes_internal}</p>
          </div>
        </>
      )}

      {/* Stats */}
      <Separator />
      <div className="space-y-3">
        <h3 className="text-sm font-normal text-muted-foreground uppercase tracking-wide">Estadísticas</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-normal">{boutique.people?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Personas</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-normal">{boutique.deals?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Deals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

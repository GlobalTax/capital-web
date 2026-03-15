import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { FileText, BookOpen, ClipboardCheck, Layout, Download, ArrowRight } from 'lucide-react';
import type { LeadMagnet } from '@/types/leadMagnets';

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  report: { label: 'Informe', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  whitepaper: { label: 'Whitepaper', icon: BookOpen, color: 'bg-purple-100 text-purple-800' },
  checklist: { label: 'Checklist', icon: ClipboardCheck, color: 'bg-green-100 text-green-800' },
  template: { label: 'Plantilla', icon: Layout, color: 'bg-amber-100 text-amber-800' },
};

interface ResourceCardProps {
  resource: LeadMagnet;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const config = typeConfig[resource.type] || typeConfig.report;
  const Icon = config.icon;
  const slug = resource.landing_page_slug || resource.id;

  return (
    <Link
      to={`/recursos/biblioteca/${slug}`}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image / Placeholder */}
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {resource.featured_image_url ? (
          <img
            src={resource.featured_image_url}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
            <Icon className="w-16 h-16 text-primary/30" />
          </div>
        )}
        <Badge className={`absolute top-3 left-3 ${config.color} border-0 text-xs font-medium`}>
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
        {resource.download_count > 0 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Download className="w-3 h-3" />
            {resource.download_count.toLocaleString('es-ES')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {resource.sector && (
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            {resource.sector}
          </span>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4">
          {resource.description}
        </p>
        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 gap-1 transition-all">
          Acceder gratis <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};

export default ResourceCard;

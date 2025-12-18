import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { NewsletterType } from './NewsletterTypeSelector';
import { ContentBlock } from './ContentBlockEditor';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  geographic_location: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  short_description: string | null;
  project_status: string;
}

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  featured_image_url: string | null;
  reading_time: number;
}

interface NewsletterPreviewProps {
  subject: string;
  introText: string;
  operations?: Operation[];
  selectedArticles?: string[];
  contentBlocks?: ContentBlock[];
  headerImageUrl?: string | null;
  newsletterType?: NewsletterType;
  onClose: () => void;
}

function formatCurrency(amount: number | null): string {
  if (!amount) return "Consultar";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const NewsletterPreview: React.FC<NewsletterPreviewProps> = ({
  subject,
  introText,
  operations = [],
  selectedArticles = [],
  contentBlocks = [],
  headerImageUrl,
  newsletterType = 'opportunities',
  onClose,
}) => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);

  useEffect(() => {
    if (newsletterType === 'news' && selectedArticles.length > 0) {
      fetchArticles();
    }
  }, [newsletterType, selectedArticles]);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, category, featured_image_url, reading_time')
      .in('id', selectedArticles);
    if (data) setArticles(data as BlogArticle[]);
  };

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderOpportunities = () => (
    <>
      {/* Value Prop */}
      <div className="mx-8 mb-6 bg-slate-50 rounded-xl p-5">
        <p className="font-semibold text-slate-900 mb-3">¿Por qué usar nuestro Marketplace?</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>✓ Acceso a la red más amplia de asesores M&A en España</li>
          <li>✓ Todas las operaciones con mandato directo</li>
          <li>✓ Due diligence verificado</li>
        </ul>
      </div>

      {/* Section Title */}
      <div className="px-8 py-4 border-t border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 text-center">
          🏆 OPORTUNIDADES DE LA SEMANA
        </h2>
      </div>

      {/* Operations */}
      <div className="px-8 py-6 space-y-4">
        {operations.map((op) => (
          <div key={op.id} className="border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">🏢 {op.company_name}</h3>
              <Badge 
                variant={op.project_status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {op.project_status === 'active' ? 'Activo' : 
                 op.project_status === 'upcoming' ? 'Próximo' : 'Exclusivo'}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-slate-600 mb-3">
              <p>📍 <strong>Sector:</strong> {op.sector}</p>
              <p>📍 <strong>Ubicación:</strong> {op.geographic_location || "España"}</p>
              <p>💰 <strong>Facturación:</strong> {formatCurrency(op.revenue_amount)}</p>
              <p>📊 <strong>EBITDA:</strong> {formatCurrency(op.ebitda_amount)}</p>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {op.short_description || "Oportunidad de inversión disponible..."}
            </p>
            <div className="text-center">
              <button className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3 rounded-lg text-sm font-semibold">
                📩 Solicitar Información
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-8 pb-8 text-center">
        <button className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-lg font-semibold">
          🔍 Ver Todas las Oportunidades
        </button>
      </div>
    </>
  );

  const renderNews = () => (
    <>
      {/* Section Title */}
      <div className="px-8 py-4 border-t border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 text-center">
          📰 NOTICIAS M&A
        </h2>
      </div>

      {/* Articles */}
      <div className="px-8 py-6 space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="border border-slate-200 rounded-xl overflow-hidden">
            {article.featured_image_url && (
              <img 
                src={article.featured_image_url} 
                alt={article.title} 
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-5">
              <Badge variant="secondary" className="mb-2">{article.category}</Badge>
              <h3 className="font-bold text-slate-900 mb-2">{article.title}</h3>
              <p className="text-sm text-slate-600 mb-3">
                {article.excerpt || "Lee el artículo completo..."}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{article.reading_time} min lectura</span>
                <button className="text-sm font-semibold text-slate-900 hover:underline">
                  Leer más →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-8 pb-8 text-center">
        <button className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-lg font-semibold">
          📚 Ver Todos los Artículos
        </button>
      </div>
    </>
  );

  const renderContentBlocks = () => (
    <div className="px-8 py-6 space-y-6">
      {contentBlocks.map((block) => {
        switch (block.type) {
          case 'text':
            return (
              <div key={block.id} className="prose prose-slate max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap">{block.content}</p>
              </div>
            );
          case 'cta':
            return (
              <div key={block.id} className="text-center py-4">
                <button className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-lg font-semibold">
                  {block.ctaText || 'Ver más'}
                </button>
              </div>
            );
          case 'image':
            return (
              <div key={block.id} className="text-center">
                <img 
                  src={block.content} 
                  alt="Newsletter image" 
                  className="max-w-full rounded-lg mx-auto"
                />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );

  const getTitle = () => {
    switch (newsletterType) {
      case 'opportunities': return 'Oportunidades de la Semana';
      case 'news': return 'Noticias M&A';
      case 'updates': return 'Novedades de Capittal';
      case 'educational': return 'Contenido Educativo';
      default: return 'Newsletter';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Vista Previa: {getTitle()}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh]">
          <div className="bg-slate-100 p-6 rounded-lg">
            {/* Email Preview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">CAPITTAL</h1>
                <p className="text-slate-400 text-sm mt-1">{getTitle()}</p>
              </div>

              {/* Header Image */}
              {headerImageUrl && (
                <img 
                  src={headerImageUrl} 
                  alt="Header" 
                  className="w-full h-48 object-cover"
                />
              )}

              {/* Date */}
              <div className="text-center pt-6 px-8">
                <p className="text-sm text-slate-500">📅 {currentDate}</p>
              </div>

              {/* Intro */}
              <div className="px-8 py-6">
                <p className="text-slate-700">
                  Hola <strong>[Nombre]</strong>,
                </p>
                {introText && (
                  <p className="text-slate-700 mt-4">{introText}</p>
                )}
              </div>

              {/* Type-specific content */}
              {newsletterType === 'opportunities' && renderOpportunities()}
              {newsletterType === 'news' && renderNews()}
              {(newsletterType === 'updates' || newsletterType === 'educational') && renderContentBlocks()}

              {/* Footer */}
              <div className="bg-slate-50 p-6 text-center border-t border-slate-200">
                <p className="font-semibold text-slate-900">CAPITTAL · Especialistas en M&A</p>
                <p className="text-sm text-slate-500">info@capittal.es · capittal.es</p>
                <p className="text-xs text-slate-400 mt-3 underline cursor-pointer">
                  Darse de baja
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

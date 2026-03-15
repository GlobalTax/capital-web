import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Reusable banner for service pages (venta-empresas, hub, etc.)
 */
const GuideDownloadBanner = () => {
  return (
    <section className="py-12 bg-muted/40">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="p-4 bg-white/10 rounded-xl flex-shrink-0">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-medium mb-1">
              Guía Gratuita: Cómo Vender tu Empresa
            </h3>
            <p className="text-sm text-gray-300">
              12 capítulos con valoración, fiscalidad, due diligence y checklist de preparación.
            </p>
          </div>
          <Link to="/recursos/guia-vender-empresa" className="flex-shrink-0">
            <Button className="bg-white text-slate-900 hover:bg-gray-100 font-semibold gap-2">
              Descargar PDF
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GuideDownloadBanner;

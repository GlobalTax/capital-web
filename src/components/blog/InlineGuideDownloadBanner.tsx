import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InlineGuideDownloadBanner = () => {
  return (
    <div className="my-10 p-6 sm:p-8 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50 border border-emerald-200/50 not-prose">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
          <BookOpen className="h-7 w-7 text-emerald-700" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-foreground mb-1">
            📥 Guía Gratuita: Cómo Vender tu Empresa
          </h4>
          <p className="text-sm text-muted-foreground">
            12 capítulos con valoración, due diligence, fiscalidad y checklist de preparación.
          </p>
        </div>
        <Link to="/recursos/guia-vender-empresa" className="flex-shrink-0">
          <Button size="sm" className="gap-2 whitespace-nowrap">
            Descargar PDF
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default InlineGuideDownloadBanner;

import { Link } from 'react-router-dom';
import { BookOpen, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogGuideDownloadCTA = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-white/10 rounded-lg">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="font-normal text-lg leading-tight">
          Guía: Vender tu Empresa
        </h3>
      </div>
      
      <p className="text-slate-300 text-sm mb-5 leading-relaxed">
        8 capítulos con todo lo que necesitas saber para vender tu empresa al mejor precio.
      </p>
      
      <ul className="space-y-2.5 mb-6">
        <li className="flex items-center gap-2.5 text-sm">
          <Check className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-slate-300">Valoración y múltiplos</span>
        </li>
        <li className="flex items-center gap-2.5 text-sm">
          <Check className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-slate-300">Fiscalidad y due diligence</span>
        </li>
        <li className="flex items-center gap-2.5 text-sm">
          <Check className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-slate-300">Checklist de preparación</span>
        </li>
      </ul>
      
      <Link to="/recursos/guia-vender-empresa">
        <Button 
          className="w-full bg-white text-slate-900 hover:bg-slate-50 font-semibold h-11"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF Gratis
        </Button>
      </Link>
      
      <p className="text-center text-xs text-slate-400/60 mt-4">
        +20 páginas · 100% gratuita
      </p>
    </div>
  );
};

export default BlogGuideDownloadCTA;

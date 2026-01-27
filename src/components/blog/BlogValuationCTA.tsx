import { Link } from 'react-router-dom';
import { Calculator, Check, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogValuationCTA = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-white/10 rounded-lg">
          <Calculator className="h-6 w-6" />
        </div>
        <h3 className="font-normal text-lg leading-tight">
          ¿Cuánto vale tu empresa?
        </h3>
      </div>
      
      <p className="text-gray-300 text-sm mb-5 leading-relaxed">
        Descubre el valor real de tu negocio en menos de 5 minutos con nuestra calculadora profesional.
      </p>
      
      <ul className="space-y-2.5 mb-6">
        <li className="flex items-center gap-2.5 text-sm">
          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
          <span className="text-gray-200">100% gratuito y confidencial</span>
        </li>
        <li className="flex items-center gap-2.5 text-sm">
          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
          <span className="text-gray-200">Metodología EBITDA profesional</span>
        </li>
        <li className="flex items-center gap-2.5 text-sm">
          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
          <span className="text-gray-200">Informe PDF descargable</span>
        </li>
      </ul>
      
      <Link to="/lp/calculadora-web">
        <Button 
          className="w-full bg-white text-slate-900 hover:bg-gray-100 font-semibold h-11"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Calcular Valoración Gratis
        </Button>
      </Link>
      
      <p className="text-center text-xs text-gray-400 mt-4">
        +500 empresas ya valoradas
      </p>
    </div>
  );
};

export default BlogValuationCTA;

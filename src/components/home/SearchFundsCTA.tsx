import React from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight } from 'lucide-react';

const SearchFundsCTA = () => {
  return (
    <section className="py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/servicios/search-funds">
          <div className="bg-slate-900 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-slate-800 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-lg md:text-xl font-semibold text-white">
                  ¿Eres Search Fund?
                </h3>
                <p className="text-slate-300 text-sm md:text-base">
                  Accede a nuestro centro especializado con recursos, operaciones y herramientas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white group-hover:translate-x-1 transition-transform">
              <span className="font-medium">Visitar centro</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default SearchFundsCTA;

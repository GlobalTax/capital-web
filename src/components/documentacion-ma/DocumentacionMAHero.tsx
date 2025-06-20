
import React from 'react';
import { BookOpen } from 'lucide-react';

const DocumentacionMAHero = () => {
  return (
    <section className="pt-32 pb-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-4xl">
          <h1 className="text-6xl font-bold text-black mb-8 leading-tight">
            Documentación de M&A
          </h1>
          <p className="text-2xl text-gray-500 mb-12 leading-relaxed max-w-3xl">
            Guía completa sobre fusiones y adquisiciones. Todo lo que necesitas saber 
            sobre procesos, valoraciones, due diligence y mejores prácticas en M&A.
          </p>
          <div className="flex items-center gap-3 text-gray-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-lg">Tiempo de lectura: 25 minutos</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentacionMAHero;

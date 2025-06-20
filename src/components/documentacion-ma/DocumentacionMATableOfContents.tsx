
import React from 'react';

const DocumentacionMATableOfContents = () => {
  const navigationItems = [
    { label: 'Introducción a M&A', href: '#introduccion' },
    { label: 'Tipos de Operaciones', href: '#tipos-operaciones' },
    { label: 'Proceso de M&A', href: '#proceso-ma' },
    { label: 'Métodos de Valoración', href: '#valoracion' },
    { label: 'Due Diligence', href: '#due-diligence' },
    { label: 'Estructuras de Financiación', href: '#financiacion' },
    { label: 'Aspectos Legales', href: '#aspectos-legales' },
    { label: 'Integración Post-M&A', href: '#integracion' }
  ];

  return (
    <div className="bg-gray-50/30 rounded-2xl p-8 mb-16">
      <h3 className="text-2xl font-light text-gray-900 mb-8">Contenido de esta guía</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {navigationItems.map((item, index) => (
          <a 
            key={index}
            href={item.href} 
            className="flex items-center py-3 px-4 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all duration-200 group"
          >
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-4 text-xs text-gray-500 group-hover:bg-gray-300 transition-colors">
              {index + 1}
            </div>
            <span className="font-light">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DocumentacionMATableOfContents;

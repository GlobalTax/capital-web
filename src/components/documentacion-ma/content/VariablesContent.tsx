
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const VariablesContent = () => {
  return (
    <div className="max-w-none">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-black hover:text-black">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/documentacion-ma" className="text-black hover:text-black">Documentación M&A</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-black">Variables</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-black mb-6 leading-tight">
          Variables
        </h1>
        <p className="text-xl text-black leading-relaxed mb-8 max-w-3xl font-light">
          Las <strong>variables clave</strong> en operaciones de M&A que determinan el éxito de cada transacción y requieren análisis detallado.
        </p>
        <div className="flex items-center gap-4 text-sm text-black">
          <span>Last updated</span>
          <span>June 20, 2025</span>
        </div>
      </div>

      {/* Rich Text Content */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-medium text-black mb-8">Variables Críticas en M&A</h2>
        
        <p className="text-black mb-8 leading-relaxed">
          Identificamos y analizamos las <strong>variables críticas</strong> que impactan directamente en el valor y el éxito de cada operación de fusión o adquisición.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Variables Financieras</h4>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>EBITDA y márgenes</li>
              <li>Flujo de caja libre</li>
              <li>Múltiplos de valoración</li>
              <li>Estructura de capital</li>
            </ul>
          </div>
          <div className="bg-gray-50/30 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-black mb-4">Variables Estratégicas</h4>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>Posición competitiva</li>
              <li>Sinergias potenciales</li>
              <li>Riesgos regulatorios</li>
              <li>Cultura organizacional</li>
            </ul>
          </div>
        </div>

        <h4 className="text-xl font-medium text-black mb-6">Análisis de Sensibilidad</h4>
        
        <p className="text-black mb-6 leading-relaxed">
          Realizamos <strong>análisis de sensibilidad</strong> para entender cómo las variaciones en estas variables afectan la valoración y los resultados proyectados de la operación.
        </p>

        <div className="bg-gray-50/30 p-6 rounded-lg mb-12">
          <h4 className="text-lg font-medium text-black mb-4">Impacto en Valoración</h4>
          <p className="text-black mb-4">Variación de ±10% en variables clave:</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-black font-medium">EBITDA:</span>
              <span className="text-sm text-black ml-2">±15-20% en valoración</span>
            </div>
            <div>
              <span className="text-sm text-black font-medium">Múltiplos:</span>
              <span className="text-sm text-black ml-2">±10-15% en valoración</span>
            </div>
          </div>
        </div>

        <blockquote className="border-l-4 border-gray-200 pl-6 py-4 mb-12 italic text-black bg-gray-50/30">
          "El control de las <strong>variables críticas</strong> es lo que separa las operaciones exitosas de las que no alcanzan sus objetivos."
        </blockquote>
      </div>

      {/* Related Articles */}
      <div className="border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-medium text-black mb-8">Related articles</h2>
        <div className="space-y-4">
          <a href="/documentacion-ma/nuestro-metodo" className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-lg transition-colors group">
            <span className="text-black group-hover:text-black">Nuestro método</span>
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default VariablesContent;
